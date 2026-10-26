import { supabase } from '../lib/supabaseClient'
import { getStoredConnectIds } from './connectService'

export type AddonBillingType = 'recurrent' | 'one_off' | 'usage_based' | 'free'

export interface AddonCatalogItem {
  id: string
  code: string
  name: string
  description: string
  category: string
  price: number | null // null = sob consulta
  billing_type: AddonBillingType
  setup_fee: number | null
  compatibility?: string[]
  is_active: boolean
  is_available: boolean
  sort_order: number
  created_at: string
  is_new?: boolean
}

export type AddonRequestStatus =
  | 'pending'
  | 'in_review'
  | 'awaiting_confirmation'
  | 'approved' // Apresentado como "Em preparo" até aprovação final
  | 'rejected'
  | 'cancelled'

export interface AddonRequestItem {
  id: string
  store_id: string
  addon_id: string
  addon_code?: string
  addon_name?: string
  status: AddonRequestStatus
  notes?: string
  rejection_reason?: string
  requested_by: string
  created_at: string
  updated_at: string
}

export type StoreAddonStatus = 'active' | 'suspended' | 'disabled'

export interface StoreAddonItem {
  id: string
  store_id: string
  addon_id: string
  addon_code?: string
  addon_name?: string
  status: StoreAddonStatus
  activated_at?: string
  suspended_reason?: string
}

/**
 * Consulta itens ativos e disponíveis de public.addon_catalog
 */
export async function fetchAddonCatalog(): Promise<AddonCatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('addon_catalog')
      .select('*')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.warn('[NovaesWeb] Aviso ao consultar addon_catalog:', error.message)
      return []
    }

    const now = Date.now()
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

    return (data || []).map((item: any) => ({
      id: item.id,
      code: item.code || item.slug || item.id,
      name: item.name || item.title,
      description: item.description || '',
      category: item.category || 'Geral',
      price: item.price ?? null,
      billing_type: item.billing_type || 'recurrent',
      setup_fee: item.setup_fee ?? null,
      compatibility: Array.isArray(item.compatibility) ? item.compatibility : [],
      is_active: Boolean(item.is_active),
      is_available: Boolean(item.is_available),
      sort_order: item.sort_order ?? 0,
      created_at: item.created_at || new Date().toISOString(),
      is_new: item.created_at ? now - new Date(item.created_at).getTime() <= SEVEN_DAYS_MS : false,
    }))
  } catch (err) {
    console.error('[NovaesWeb] Erro ao carregar catálogo central de adicionais:', err)
    return []
  }
}

/**
 * Consulta solicitações de adicionais da loja atual
 */
export async function fetchStoreAddonRequests(storeId: string): Promise<AddonRequestItem[]> {
  try {
    const { data, error } = await supabase
      .from('addon_requests')
      .select('*, addon_catalog(code, name)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[NovaesWeb] Aviso ao consultar addon_requests:', error.message)
      return []
    }

    return (data || []).map((req: any) => ({
      id: req.id,
      store_id: req.store_id,
      addon_id: req.addon_id,
      addon_code: req.addon_catalog?.code || req.addon_code || '',
      addon_name: req.addon_catalog?.name || req.addon_name || 'Adicional Solicitado',
      status: req.status as AddonRequestStatus,
      notes: req.notes,
      rejection_reason: req.rejection_reason,
      requested_by: req.requested_by,
      created_at: req.created_at,
      updated_at: req.updated_at,
    }))
  } catch (err) {
    console.error('[NovaesWeb] Erro ao carregar solicitações de adicionais:', err)
    return []
  }
}

/**
 * Consulta permissões ativas em store_addons da loja atual (Apenas leitura sob RLS)
 */
export async function fetchStoreAddons(storeId: string): Promise<StoreAddonItem[]> {
  try {
    const { data, error } = await supabase
      .from('store_addons')
      .select('*, addon_catalog(code, name)')
      .eq('store_id', storeId)

    if (error) {
      console.warn('[NovaesWeb] Aviso ao consultar store_addons:', error.message)
      return []
    }

    return (data || []).map((sa: any) => ({
      id: sa.id,
      store_id: sa.store_id,
      addon_id: sa.addon_id,
      addon_code: sa.addon_catalog?.code || sa.addon_code || '',
      addon_name: sa.addon_catalog?.name || sa.addon_name || 'Adicional Contratado',
      status: sa.status as StoreAddonStatus,
      activated_at: sa.activated_at || sa.created_at,
      suspended_reason: sa.suspended_reason,
    }))
  } catch (err) {
    console.error('[NovaesWeb] Erro ao carregar adicionais contratados:', err)
    return []
  }
}

/**
 * Envia uma nova solicitação para o Painel Master
 * REGRA RIGOROSA: Grava apenas em addon_requests.
 * NUNCA escreve em store_addons nem aprova a solicitação.
 */
export async function submitAddonRequest(
  storeId: string,
  addonId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData?.session?.user) {
      return {
        success: false,
        error: 'É necessário estar autenticado com uma conta autorizada para solicitar adicionais.',
      }
    }

    const userId = sessionData.session.user.id

    const { error: insertError } = await supabase.from('addon_requests').insert({
      store_id: storeId,
      addon_id: addonId,
      requested_by: userId,
      status: 'pending',
      notes: notes?.trim() || null,
    })

    if (insertError) {
      throw insertError
    }

    return { success: true }
  } catch (err: any) {
    console.error('[NovaesWeb] Falha ao enviar solicitação de adicional:', err)
    return {
      success: false,
      error: err?.message || 'Não foi possível registrar a solicitação no Supabase Central.',
    }
  }
}

/**
 * Assina atualizações em tempo real (Supabase Realtime) com reconciliação periódica
 */
export function subscribeAddonsRealtime(
  storeId: string,
  onUpdate: () => void
): () => void {
  // 1. Canal Realtime filtrando eventos das tabelas centrais
  const channel = supabase
    .channel(`addons_live_${storeId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'addon_catalog' },
      () => {
        // Refaz a consulta sob RLS em vez de confiar cegamente no payload
        onUpdate()
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'addon_requests', filter: `store_id=eq.${storeId}` },
      () => {
        onUpdate()
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'store_addons', filter: `store_id=eq.${storeId}` },
      () => {
        onUpdate()
      }
    )
    .subscribe()

  // 2. Reconciliação periódica a cada 60 segundos enquanto a página estiver visível
  const intervalId = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      onUpdate()
    }
  }, 60000)

  // 3. Reconciliação ao voltar o foco para a aba
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      onUpdate()
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  return () => {
    clearInterval(intervalId)
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    supabase.removeChannel(channel).catch(() => {})
  }
}
