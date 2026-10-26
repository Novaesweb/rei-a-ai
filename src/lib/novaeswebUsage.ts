import { supabase } from './supabaseClient'

// Deduplication cache stored in localStorage to prevent double-counting across reloads
const DEDUP_KEY = 'novaesweb_reported_accepted_orders'

function getReportedOrders(): Set<string> {
  try {
    const raw = localStorage.getItem(DEDUP_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function markOrderReported(orderId: string): void {
  try {
    const set = getReportedOrders()
    set.add(String(orderId))
    localStorage.setItem(DEDUP_KEY, JSON.stringify(Array.from(set)))
  } catch (err) {
    console.warn('[NovaesWeb] Falha ao persistir cache de deduplicação:', err)
  }
}

export function isOrderAlreadyReported(orderId: string): boolean {
  return getReportedOrders().has(String(orderId))
}

/**
 * Reporta pedido aceito ao Painel Master da NovaesWeb.
 * Deduplicação rígida: executa apenas uma única vez por pedido.
 * Privacidade total: NÃO envia valores financeiros, dados pessoais ou itens comprados.
 */
export async function reportOrderAcceptedToMaster(order: {
  id: string
  createdAt?: string
  acceptedAt?: string
}): Promise<{ success: boolean; deduplicated?: boolean; error?: string }> {
  const orderRef = String(order.id)

  // 1. Verificação local de deduplicação
  if (isOrderAlreadyReported(orderRef)) {
    console.info(`[NovaesWeb] Pedido ${orderRef} já foi contabilizado anteriormente. Deduplicação ativa.`)
    return { success: true, deduplicated: true }
  }

  const storeId =
    import.meta.env.VITE_NOVAESWEB_STORE_ID ||
    import.meta.env.VITE_STORE_ID ||
    'acai-do-rei-canoas'

  const occurredAt = order.acceptedAt || order.createdAt || new Date().toISOString()

  try {
    // 2. Invoca a RPC oficial novaesweb_record_order_event
    const { error: rpcError } = await supabase.rpc('novaesweb_record_order_event', {
      p_store_id: storeId,
      p_order_ref: orderRef,
      p_event_type: 'accepted',
      p_occurred_at: occurredAt,
    })

    if (!rpcError) {
      markOrderReported(orderRef)
      console.log(`[NovaesWeb] Pedido aceito ${orderRef} registrado com sucesso via RPC principal.`)
      return { success: true }
    }

    // 3. Fallback retrocompatível com a RPC legada
    const { error: fallbackError } = await supabase.rpc('novaesweb_record_order_accepted', {
      p_store_id: storeId,
      p_order_ref: orderRef,
      p_accepted_at: occurredAt,
    })

    if (!fallbackError) {
      markOrderReported(orderRef)
      console.log(`[NovaesWeb] Pedido aceito ${orderRef} registrado via RPC fallback.`)
      return { success: true }
    }

    // Mesmo com erro de RPC (ex: store_id em ambiente local de teste), marcamos deduplicação local
    markOrderReported(orderRef)
    return { success: true, error: rpcError.message }
  } catch (err: any) {
    // Falha silenciosa para NUNCA travar a operação de venda do lojista
    console.error('[NovaesWeb] Aviso ao reportar evento de franquia:', err)
    markOrderReported(orderRef)
    return { success: false, error: err?.message || 'Erro de conexão' }
  }
}
