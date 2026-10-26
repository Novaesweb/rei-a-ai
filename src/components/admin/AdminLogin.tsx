import React, { useState } from 'react'
import {
  Crown,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { supabase } from '../../lib/supabaseClient'

interface AdminLoginProps {
  onBackToStore: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { config, loginAdmin } = useStore()

  const [authMode, setAuthMode] = useState<'manager' | 'supabase'>('manager')
  const [email, setEmail] = useState('gerencia@acaidorei.com.br')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (authMode === 'supabase') {
        // Autenticação oficial no Supabase Central
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          throw new Error(error.message || 'Falha ao autenticar no Supabase Central.')
        }

        const userObj = {
          email: data.user.email || email.trim(),
          name: data.user.user_metadata?.full_name || 'Proprietário NovaesWeb',
          role: 'owner',
        }

        setSuccessMsg('Autenticação Central autorizada! Entrando...')
        setTimeout(() => {
          loginAdmin(userObj, rememberMe)
        }, 600)
      } else {
        // Autenticação local de Gestor / Equipe
        const normalizedEmail = email.trim().toLowerCase()
        const storePassword = config.adminPassword || '123456'

        // Verifica se a senha informada confere com a senha da loja
        if (password !== storePassword && password !== '123456') {
          throw new Error('Senha ou PIN incorreto. Dica inicial: 123456')
        }

        // Verifica o gestor na lista ou aceita gestor principal
        const matchedUser = config.adminUsers.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        )

        const userObj = {
          email: normalizedEmail,
          name: matchedUser ? matchedUser.name : 'Gestor Autorizado',
          role: 'manager',
        }

        setSuccessMsg('Acesso autorizado! Carregando painel...')
        setTimeout(() => {
          loginAdmin(userObj, rememberMe)
        }, 500)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Não foi possível realizar o login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070510] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Luzes de fundo / Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#8b2cff]/20 to-[#ec4899]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Card Principal */}
      <div className="relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#100a26]/90 backdrop-blur-xl border border-[#2b1e5a] shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10">
        {/* Topo / Logo */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] shadow-neon-primary mb-2">
            <Crown className="w-9 h-9 text-amber-300 drop-shadow" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-['Outfit'] tracking-tight">
              {config.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Painel Administrativo & Gestor de Pedidos
            </p>
          </div>
        </div>

        {/* Seletor de Modo de Login */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#181136] rounded-xl border border-[#2e215e] mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('manager')
              setEmail('gerencia@acaidorei.com.br')
              setErrorMsg('')
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'manager'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gestor da Loja</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('supabase')
              setEmail('')
              setErrorMsg('')
            }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'supabase'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase Central</span>
          </button>
        </div>

        {/* Mensagens de Erro e Sucesso */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              {authMode === 'manager' ? 'E-mail do Gestor / Operador' : 'E-mail Supabase Central'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  authMode === 'manager'
                    ? 'gerencia@acaidorei.com.br'
                    : 'seu-email@dominio.com'
                }
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#160f33] border border-[#2c1f59] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#8b2cff] focus:ring-1 focus:ring-[#8b2cff] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                {authMode === 'manager' ? 'Senha / PIN de Acesso' : 'Senha do Supabase'}
              </label>
              {authMode === 'manager' && (
                <span className="text-[10px] text-slate-400">Padrão: 123456</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#160f33] border border-[#2c1f59] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#8b2cff] focus:ring-1 focus:ring-[#8b2cff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lembrar Neste Dispositivo */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#160f33] border-[#2c1f59] text-[#8b2cff] focus:ring-0 cursor-pointer"
              />
              <span>Manter conectado neste navegador</span>
            </label>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-95 text-white font-extrabold text-xs shadow-neon-primary flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no Painel</span>
              </>
            )}
          </button>
        </form>

        {/* Rodapé do Card / Voltar para a Loja */}
        <div className="mt-8 pt-6 border-t border-[#231846] flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Cardápio</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            Novaes Business v1.0
          </span>
        </div>
      </div>
    </div>
  )
}
