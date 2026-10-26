import { supabase } from './supabaseClient'
import { getStoredConnectIds } from '../services/connectService'

export type OrderLifecycleEventType =
  | 'created'
  | 'accepted'
  | 'rejected'
  | 'delivered'
  | 'cancelled'
  | 'hidden'

export type OrderCancellationCategory =
  | 'cliente_desistiu'
  | 'endereco_fora_raio'
  | 'item_esgotado'
  | 'estabelecimento_lotado'
  | 'erro_operacional_loja'
  | 'falha_comunicacao'
  | 'outros'

export interface RecordOrderEventParams {
  orderRef: string
  eventType: OrderLifecycleEventType
  statusFrom?: string
  statusTo?: string
  reasonCategory?: OrderCancellationCategory
  occurredAt?: string
}

const STORAGE_KEYS = {
  DEDUP_ACCEPTED: 'novaesweb_reported_accepted_orders',
  PENDING_QUEUE: 'novaesweb_pending_order_events',
}

/**
 * Retorna a competência no fuso America/Sao_Paulo (ex: "2026-10")
 */
export function getSaoPauloCompetence(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
  })
  return formatter.format(d).slice(0, 7)
}

/**
 * Retorna a chave de dia no fuso America/Sao_Paulo (ex: "26/10")
 */
export function getSaoPauloDayKey(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
  })
  return formatter.format(d)
}

/**
 * Retorna o rótulo da competência em português (ex: "Outubro de 2026")
 */
export function getSaoPauloCompetenceLabel(competenceStr: string): string {
  const [yearStr, monthStr] = competenceStr.split('-')
  const monthNum = parseInt(monthStr, 10)
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const name = monthNames[monthNum - 1] || monthStr
  return `${name} de ${yearStr}`
}

/**
 * Cache local de deduplicação para garantir envio único por pedido aceito
 */
function getReportedAcceptedOrders(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEDUP_ACCEPTED)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function markOrderAcceptedLocally(orderRef: string): void {
  try {
    const set = getReportedAcceptedOrders()
    set.add(String(orderRef))
    localStorage.setItem(STORAGE_KEYS.DEDUP_ACCEPTED, JSON.stringify(Array.from(set)))
  } catch (err) {
    console.warn('[NovaesWeb] Falha ao persistir cache de deduplicação:', err)
  }
}

export function isOrderAlreadyCounted(orderRef: string): boolean {
  return getReportedAcceptedOrders().has(String(orderRef))
}

/**
 * Fila offline-first para retentativa segura de eventos de pedidos
 */
interface PendingEventItem {
  id: string
  params: RecordOrderEventParams
  storeId: string
  attempts: number
  queuedAt: string
}

function getPendingEvents(): PendingEventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_QUEUE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function queuePendingEvent(params: RecordOrderEventParams, storeId: string): void {
  try {
    const items = getPendingEvents()
    items.push({
      id: `${params.orderRef}-${params.eventType}-${Date.now()}`,
      params,
      storeId,
      attempts: 0,
      queuedAt: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(items))
  } catch (err) {
    console.warn('[NovaesWeb] Erro ao enfileirar evento pendente:', err)
  }
}

function removePendingEvent(eventId: string): void {
  try {
    const items = getPendingEvents().filter((i) => i.id !== eventId)
    localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(items))
  } catch {
    // Ignore
  }
}

/**
 * Registra evento oficial de ciclo de vida do pedido no Supabase Central.
 * 
 * Regras Obrigatórias (Caderno 09 / Prompt 5):
 * 1. Apenas pedidos ACEITOS entram na franquia e faturamento da NovaesWeb.
 * 2. Pedidos criados/rejeitados NÃO consom a franquia.
 * 3. Pedidos aceitos e depois cancelados CONTINUAM contabilizados.
 * 4. Deduplicação técnica rígida: cada pedido conta uma única vez.
 * 5. Privacidade total: NUNCA envia valor, itens, carrinho ou dados pessoais do cliente.
 */
export async function recordOrderLifecycleEvent(
  params: RecordOrderEventParams
): Promise<{ success: boolean; alreadyCounted?: boolean; error?: string }> {
  const storeId =
    getStoredConnectIds().storeId ||
    import.meta.env.VITE_NOVAESWEB_STORE_ID ||
    import.meta.env.VITE_STORE_ID ||
    'acai-do-rei-canoas'

  const orderRef = String(params.orderRef)
  const occurredAt = params.occurredAt || new Date().toISOString()

  // Se for evento de aceite e já foi reportado localmente, evita tráfego redundante
  if (params.eventType === 'accepted' && isOrderAlreadyCounted(orderRef)) {
    console.info(`[NovaesWeb] Pedido ${orderRef} já contabilizado anteriormente. Deduplicação ativa.`)
    return { success: true, alreadyCounted: true }
  }

  try {
    // 1. Invoca a RPC canônica novaesweb_record_order_event
    const { data, error: rpcError } = await supabase.rpc('novaesweb_record_order_event', {
      p_store_id: storeId,
      p_order_ref: orderRef,
      p_event_type: params.eventType,
      p_status_from: params.statusFrom || null,
      p_status_to: params.statusTo || null,
      p_reason_category: params.reasonCategory || null,
      p_occurred_at: occurredAt,
    })

    if (!rpcError) {
      if (params.eventType === 'accepted') {
        markOrderAcceptedLocally(orderRef)
      }
      return {
        success: true,
        alreadyCounted: Boolean(data?.already_counted),
      }
    }

    // 2. Fallback de retrocompatibilidade para versões anteriores se for aceite
    if (params.eventType === 'accepted') {
      const { error: fallbackError } = await supabase.rpc('novaesweb_record_order_accepted', {
        p_store_id: storeId,
        p_order_ref: orderRef,
        p_accepted_at: occurredAt,
      })

      if (!fallbackError) {
        markOrderAcceptedLocally(orderRef)
        return { success: true }
      }
    }

    // Enfileira para retentativa se for falha transitória/rede
    queuePendingEvent(params, storeId)
    return { success: true, error: rpcError.message }
  } catch (err: any) {
    console.error('[NovaesWeb] Falha de conexão ao emitir evento de pedido:', err)
    // Falha silenciosa para NUNCA travar a operação de venda do lojista
    queuePendingEvent(params, storeId)
    if (params.eventType === 'accepted') {
      markOrderAcceptedLocally(orderRef)
    }
    return { success: false, error: err?.message || 'Erro de conexão' }
  }
}

/**
 * Função utilitária para compatibilidade com o módulo de aceite
 */
export async function reportOrderAcceptedToMaster(order: {
  id: string
  createdAt?: string
  acceptedAt?: string
}) {
  return recordOrderLifecycleEvent({
    orderRef: order.id,
    eventType: 'accepted',
    statusFrom: 'pending',
    statusTo: 'preparing',
    occurredAt: order.acceptedAt || order.createdAt || new Date().toISOString(),
  })
}

/**
 * Esvazia a fila de eventos pendentes em background (quando online)
 */
export async function flushPendingOrderEvents(): Promise<void> {
  const pending = getPendingEvents()
  if (pending.length === 0) return

  for (const item of pending) {
    try {
      await supabase.rpc('novaesweb_record_order_event', {
        p_store_id: item.storeId,
        p_order_ref: item.params.orderRef,
        p_event_type: item.params.eventType,
        p_status_from: item.params.statusFrom || null,
        p_status_to: item.params.statusTo || null,
        p_reason_category: item.params.reasonCategory || null,
        p_occurred_at: item.params.occurredAt || item.queuedAt,
      })
      removePendingEvent(item.id)
    } catch {
      // Re-tenta no próximo ciclo
    }
  }
}

// Configura listener para esvaziar fila quando a conexão for reestabelecida
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushPendingOrderEvents())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void flushPendingOrderEvents()
    }
  })
}
