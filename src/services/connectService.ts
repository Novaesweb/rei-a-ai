import { supabase } from '../lib/supabaseClient'

export interface ConnectState {
  storeId: string | null
  nxId: string | null
  siteName: string | null
  integrationStatus: 'unregistered' | 'pending' | 'active' | 'suspended' | 'maintenance' | 'error'
  lastSeenAt: string | null
  isAuthenticated: boolean
  userEmail: string | null
  error?: string
}

const STORAGE_KEYS = {
  IDEMPOTENCY_KEY: 'novaesweb_connect_idempotency_key',
  STORE_ID: 'novaesweb_official_store_id',
  NX_ID: 'novaesweb_official_nx_id',
  SITE_NAME: 'novaesweb_official_site_name',
  LAST_SEEN: 'novaesweb_last_seen_at',
}

/**
 * Retorna ou gera a chave de idempotência do registro automático
 */
export function getOrCreateIdempotencyKey(): string {
  let key = localStorage.getItem(STORAGE_KEYS.IDEMPOTENCY_KEY)
  if (!key) {
    key = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEYS.IDEMPOTENCY_KEY, key)
  }
  return key
}

/**
 * Obtém os identificadores oficiais persistidos
 */
export function getStoredConnectIds(): { storeId: string; nxId: string; siteName: string } {
  const storeId =
    localStorage.getItem(STORAGE_KEYS.STORE_ID) ||
    import.meta.env.VITE_NOVAESWEB_STORE_ID ||
    import.meta.env.VITE_STORE_ID ||
    '3b15518d-2edc-43d7-85ac-6ece2a82d40f'

  const nxId =
    localStorage.getItem(STORAGE_KEYS.NX_ID) ||
    import.meta.env.VITE_NOVAESWEB_NX_ID ||
    import.meta.env.VITE_STORE_NX_ID ||
    'NX-3B15518D2EDC43D785AC6ECE2A82D40F'

  const siteName = localStorage.getItem(STORAGE_KEYS.SITE_NAME) || 'Açaí do Rei'

  return { storeId, nxId, siteName }
}

/**
 * Salva identificadores oficiais retornados pelo backend central
 */
export function persistOfficialIds(storeId: string, nxId: string, siteName: string) {
  localStorage.setItem(STORAGE_KEYS.STORE_ID, storeId)
  localStorage.setItem(STORAGE_KEYS.NX_ID, nxId)
  localStorage.setItem(STORAGE_KEYS.SITE_NAME, siteName)
}

/**
 * Executa o auto-cadastro seguro via Edge Function novaesweb-site-register
 * Sem aprovação manual do Master. Exige sessão autenticada.
 */
export async function registerSiteAutomatically(siteName = 'Açaí do Rei', ownerName = 'Proprietário Açaí do Rei') {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !sessionData?.session) {
    throw new Error('É necessária uma sessão autenticada no Supabase Central para registrar a loja.')
  }

  const idempotency_key = getOrCreateIdempotencyKey()

  // Invoca novaesweb-site-register com JWT autenticado
  const { data, error } = await supabase.functions.invoke('novaesweb-site-register', {
    body: {
      site_name: siteName,
      owner_name: ownerName,
      idempotency_key,
    },
  })

  if (error) {
    throw new Error(error.message || 'Erro ao registrar a loja via Edge Function central.')
  }

  if (!data?.store_id || !data?.nx_id) {
    throw new Error(data?.error || 'A resposta do backend não retornou os identificadores oficiais.')
  }

  persistOfficialIds(data.store_id, data.nx_id, data.site_name || siteName)

  return {
    status: data.status as 'registered' | 'already_registered',
    storeId: data.store_id as string,
    nxId: data.nx_id as string,
    siteName: (data.site_name || siteName) as string,
  }
}

/**
 * Executa o check-in oficial da loja via novaesweb-admin
 */
export async function performSiteCheckin(nxId?: string) {
  const targetNxId = nxId || getStoredConnectIds().nxId

  if (!targetNxId) {
    throw new Error('NX ID oficial não configurado para check-in.')
  }

  const { data, error } = await supabase.functions.invoke('novaesweb-admin', {
    body: {
      action: 'site_checkin',
      nx_id: targetNxId,
      engine_version: '5.2',
    },
  })

  if (error) {
    throw new Error(error.message || 'Falha ao executar check-in no backend central.')
  }

  const now = new Date().toISOString()
  localStorage.setItem(STORAGE_KEYS.LAST_SEEN, now)

  return {
    success: true,
    data,
    lastSeenAt: now,
  }
}
