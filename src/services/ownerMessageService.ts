import { supabase } from '../lib/supabaseClient'

export interface OwnerMessage {
  id: string
  store_id: string
  recipient_user_id: string
  category: string
  title: string
  body: string
  created_by: string
  created_at: string
  read_at: string | null
}

/**
 * Consulta mensagens administrativas enviadas pelo Master para a conta nesta loja
 */
export async function getOwnerMessages(storeId: string): Promise<OwnerMessage[]> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData?.session) return []

    const { data, error } = await supabase
      .from('store_owner_messages')
      .select('id, store_id, recipient_user_id, category, title, body, created_by, created_at, read_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[NovaesWeb] Aviso ao consultar mensagens do lojista:', error.message)
      return []
    }

    return (data || []) as OwnerMessage[]
  } catch (err) {
    console.error('[NovaesWeb] Erro ao carregar mensagens:', err)
    return []
  }
}

/**
 * Marca uma mensagem como lida pelo destinatário
 */
export async function markOwnerMessageRead(storeId: string, messageId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('store_owner_messages')
      .update({ read_at: now })
      .eq('store_id', storeId)
      .eq('id', messageId)

    if (error) {
      console.warn('[NovaesWeb] Erro ao marcar mensagem como lida:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[NovaesWeb] Falha ao atualizar leitura da mensagem:', err)
    return false
  }
}
