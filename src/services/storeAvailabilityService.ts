import { supabase } from '../lib/supabaseClient'

export interface StoreAvailability {
  status: 'active' | 'maintenance' | 'suspended' | 'pending' | 'archived' | 'unavailable'
  blockMode?: 'message' | 'maintenance' | 'suspension' | null
  message?: string | null
  returnAt?: string | null
}

const DEFAULT_AVAILABILITY: StoreAvailability = {
  status: 'active',
  blockMode: null,
  message: null,
  returnAt: null,
}

/**
 * Consulta o status público do estabelecimento via RPC seguro
 */
export async function fetchStoreAvailability(storeId: string): Promise<StoreAvailability> {
  if (!storeId || storeId === 'acai-do-rei-canoas') {
    // Modo local / fallback ativo padrão
    return DEFAULT_AVAILABILITY
  }

  try {
    const { data, error } = await supabase.rpc('delivery_public_availability', {
      p_store_id: storeId,
    })

    if (error) {
      console.warn('[NovaesWeb] Aviso ao consultar availability RPC:', error.message)
      return DEFAULT_AVAILABILITY
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) return DEFAULT_AVAILABILITY

    return {
      status: row.status || 'active',
      blockMode: row.block_mode || null,
      message: row.block_message || null,
      returnAt: row.block_until || null,
    }
  } catch (err) {
    console.warn('[NovaesWeb] Falha de rede ao consultar availability:', err)
    return DEFAULT_AVAILABILITY
  }
}

/**
 * Assina atualizações periódicas e por visibilidade da disponibilidade da loja
 */
export function subscribeStoreAvailability(
  storeId: string,
  onUpdate: (avail: StoreAvailability) => void
): () => void {
  let active = true

  const runCheck = async () => {
    if (!active) return
    const result = await fetchStoreAvailability(storeId)
    if (active) onUpdate(result)
  }

  // 1. Executa checagem inicial
  void runCheck()

  // 2. Reconciliação ao voltar para a aba
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      void runCheck()
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  // 3. Polling moderado a cada 60 segundos
  const intervalId = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      void runCheck()
    }
  }, 60_000)

  // 4. Inscrição em canal Realtime se houver storeId UUID
  let channel: any = null
  if (storeId && storeId.includes('-')) {
    try {
      channel = supabase
        .channel(`store_availability:${storeId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'managed_sites',
            filter: `id=eq.${storeId}`,
          },
          () => {
            void runCheck()
          }
        )
        .subscribe()
    } catch {
      // Ignora erro se realtime não disponível
    }
  }

  // Cleanup
  return () => {
    active = false
    document.removeEventListener('visibilitychange', handleVisibility)
    window.clearInterval(intervalId)
    if (channel) {
      void supabase.removeChannel(channel)
    }
  }
}
