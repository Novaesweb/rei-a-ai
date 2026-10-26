import React, { useState, useEffect } from 'react'
import { Bell, Check, RefreshCw, MessageSquare, AlertCircle, Sparkles } from 'lucide-react'
import { getOwnerMessages, markOwnerMessageRead, OwnerMessage } from '../../services/ownerMessageService'
import { getStoredConnectIds } from '../../services/connectService'

interface AdminOwnerMessagesProps {
  onUnreadChange?: (count: number) => void
}

export const AdminOwnerMessages: React.FC<AdminOwnerMessagesProps> = ({ onUnreadChange }) => {
  const [messages, setMessages] = useState<OwnerMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const storeId = getStoredConnectIds().storeId || 'acai-do-rei-canoas'

  const loadMessages = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getOwnerMessages(storeId)
      setMessages(data)
      const unread = data.filter((m) => !m.read_at).length
      onUnreadChange?.(unread)
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar comunicados do Master.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMessages()

    // Reconciliação ao voltar para a aba
    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        void loadMessages()
      }
    }
    document.addEventListener('visibilitychange', handleVis)

    const timer = window.setInterval(handleVis, 60_000)

    return () => {
      document.removeEventListener('visibilitychange', handleVis)
      window.clearInterval(timer)
    }
  }, [storeId])

  const handleMarkAsRead = async (messageId: string) => {
    setMarkingId(messageId)
    const success = await markOwnerMessageRead(storeId, messageId)
    if (success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read_at: new Date().toISOString() } : m))
      )
      const unread = messages.filter((m) => m.id !== messageId && !m.read_at).length
      onUnreadChange?.(unread)
    }
    setMarkingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#130d26] border border-[#281c52]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Comunicados & Mensagens do Master
            </h2>
            <p className="text-xs text-slate-400">
              Avisos técnicos, informativos comerciais e notificações enviadas pela administração NovaesWeb
            </p>
          </div>
        </div>

        <button
          onClick={loadMessages}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a1236] hover:bg-[#25194a] border border-[#3b2b73] text-xs font-semibold text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#ec4899] ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Lista de Mensagens */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          Consultando caixa de mensagens do lojista...
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center bg-[#130d26] border border-[#281c52] rounded-3xl text-slate-400 space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
          <h4 className="text-base font-bold text-white">Nenhum comunicado no momento</h4>
          <p className="text-xs max-w-sm mx-auto">
            Quando a equipe NovaesWeb emitir avisos ou manutenções, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isUnread = !msg.read_at

            return (
              <div
                key={msg.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnread
                    ? 'bg-[#181035] border-[#8b2cff]/60 shadow-[0_0_15px_rgba(139,44,255,0.15)]'
                    : 'bg-[#110a24] border-[#251a4a] opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-[#231846]">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse" />
                    )}
                    <h3 className="text-sm font-bold text-white">{msg.title}</h3>
                    {msg.category && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#241747] text-[#c4b5fd] border border-[#3b2b73]">
                        {msg.category}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(msg.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                  {msg.body}
                </p>

                {isUnread && (
                  <div className="mt-4 pt-2 flex justify-end">
                    <button
                      onClick={() => handleMarkAsRead(msg.id)}
                      disabled={markingId === msg.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{markingId === msg.id ? 'Marcando...' : 'Marcar como lida'}</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
