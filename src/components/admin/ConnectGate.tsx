import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  LogIn,
  Key,
  Globe,
  ArrowRight,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import {
  registerSiteAutomatically,
  performSiteCheckin,
  getStoredConnectIds,
} from '../../services/connectService'

export const ConnectGate: React.FC = () => {
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [connectIds, setConnectIds] = useState(getStoredConnectIds())
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [registerError, setRegisterError] = useState('')

  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinSuccess, setCheckinSuccess] = useState('')
  const [checkinError, setCheckinError] = useState('')

  // Monitora sessão Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionUser(data.session?.user || null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Login no Supabase Central
  const handleAuth = async (e: React.FormEvent, isSignUp = false) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
        })
        if (error) throw error
        setSessionUser(data.user)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        })
        if (error) throw error
        setSessionUser(data.user)
      }
    } catch (err: any) {
      setAuthError(err.message || 'Falha na autenticação.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Executa o registro automático via Edge Function novaesweb-site-register
  const handleAutoRegister = async () => {
    setRegisterLoading(true)
    setRegisterError('')
    setRegisterSuccess('')

    try {
      const result = await registerSiteAutomatically('Açaí do Rei', sessionUser?.email || 'Proprietário Açaí do Rei')
      setConnectIds({
        storeId: result.storeId,
        nxId: result.nxId,
        siteName: result.siteName,
      })
      setRegisterSuccess(
        `Loja registrada com sucesso! UUID: ${result.storeId} | NX ID: ${result.nxId}`
      )

      // Executa check-in imediato
      await performSiteCheckin(result.nxId)
      setCheckinSuccess('Check-in inicial executado com status ativo!')
    } catch (err: any) {
      setRegisterError(err.message || 'Erro durante auto-registro.')
    } finally {
      setRegisterLoading(false)
    }
  }

  // Executa Check-in manual
  const handleCheckin = async () => {
    setCheckinLoading(true)
    setCheckinError('')
    setCheckinSuccess('')

    try {
      const res = await performSiteCheckin(connectIds.nxId || undefined)
      setCheckinSuccess(`Check-in confirmado em ${new Date(res.lastSeenAt).toLocaleTimeString('pt-BR')}!`)
    } catch (err: any) {
      setCheckinError(err.message || 'Erro ao executar check-in.')
    } finally {
      setCheckinLoading(false)
    }
  }

  const isStoreRegistered = Boolean(connectIds.storeId && connectIds.storeId.includes('-'))

  return (
    <div className="space-y-6">
      {/* Topo Informativo */}
      <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#231846]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Conexão Oficial NovaesWeb Connect
              </h2>
              <p className="text-xs text-slate-400">
                Integração direta com o Supabase Central da NovaesWeb sem necessidade de aprovação manual
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isStoreRegistered
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {isStoreRegistered ? 'Conectado ao Master' : 'Pendente de Registro'}
          </span>
        </div>

        {/* Identificadores Oficiais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#181133] border border-[#2b1f58]">
            <span className="text-[11px] text-slate-400 block mb-1">UUID da Loja (`store_id`)</span>
            <span className="font-mono font-bold text-white block truncate">
              {connectIds.storeId || 'Não registrado ainda'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#181133] border border-[#2b1f58]">
            <span className="text-[11px] text-slate-400 block mb-1">NX ID Público (`nx_id`)</span>
            <span className="font-mono font-bold text-[#f472b6] block truncate">
              {connectIds.nxId || 'Não gerado ainda'}
            </span>
          </div>
        </div>
      </div>

      {/* Bloco de Autenticação do Proprietário (Se não logado) */}
      {!sessionUser ? (
        <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#8b2cff]" />
            <h3 className="text-sm font-bold text-white">
              Autenticação do Proprietário no Supabase Central
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Para registrar a loja automaticamente no Master, faça login ou cadastre sua conta oficial de proprietário com e-mail confirmado.
          </p>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {authError}
            </div>
          )}

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">E-mail *</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="seu-email@dominio.com"
                className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Senha *</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={authLoading}
                onClick={(e) => handleAuth(e, false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
              >
                <span>Entrar com Minha Conta</span>
              </button>

              <button
                type="button"
                disabled={authLoading}
                onClick={(e) => handleAuth(e, true)}
                className="px-4 py-2.5 rounded-xl bg-[#1a1236] hover:bg-[#25194a] border border-[#3b2b73] text-slate-300 text-xs font-semibold transition-colors"
              >
                Criar Nova Conta
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Sessão Ativa & Ações do Connect */
        <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#231846]">
            <div>
              <span className="text-xs text-slate-400">Sessão Autenticada Central:</span>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {sessionUser.email}
              </div>
            </div>

            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10"
            >
              Desconectar
            </button>
          </div>

          {registerError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              {registerSuccess}
            </div>
          )}

          {checkinSuccess && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
              {checkinSuccess}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Botão de Registro Automático */}
            <button
              onClick={handleAutoRegister}
              disabled={registerLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs shadow-neon-primary transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {registerLoading
                  ? 'Registrando no Backend Central...'
                  : isStoreRegistered
                  ? 'Revalidar Registro com o Master'
                  : 'Gerar Registro Automático no Master'}
              </span>
            </button>

            {/* Botão de Check-in */}
            {isStoreRegistered && (
              <button
                onClick={handleCheckin}
                disabled={checkinLoading}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1a1236] hover:bg-[#25194a] border border-[#3b2b73] text-slate-200 text-xs font-bold transition-all"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${checkinLoading ? 'animate-spin' : ''}`} />
                <span>{checkinLoading ? 'Verificando...' : 'Executar Check-in Agora'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
