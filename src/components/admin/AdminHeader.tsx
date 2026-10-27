import React from 'react'
import {
  ShoppingBag,
  Layers,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Bell,
  Crown,
  Play,
  MessageSquare,
  Globe,
  LogOut,
  User,
  Puzzle,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { getStoredConnectIds } from '../../services/connectService'

export const AdminHeader: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setCurrentView,
    orders,
    products,
    soundAlertsEnabled,
    setSoundAlertsEnabled,
    playAlertSound,
    config,
    unreadMessagesCount,
    adminUser,
    logoutAdmin,
  } = useStore()

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length
  const { nxId } = getStoredConnectIds()

  return (
    <header className="sticky top-0 z-40 bg-[#0d081f] border-b border-[#281c52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Painel Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white shadow-neon-primary">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white font-['Outfit']">
                  {config.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40">
                  Painel Business
                </span>
                {/* Indicador de Versão da Plataforma */}
                <div
                  className="novaesweb-version-badge hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181133] border border-[#2e215e] text-[10px] text-slate-300 font-medium cursor-default"
                  title="NovaesWeb Commerce Engine — Versão 5.2"
                >
                  <span className="status-dot-green inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span>v5.2 • Sistema Atualizado</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Gestão Operacional de Pedidos & Delivery
              </p>
            </div>
          </div>

          {/* Controles de Som & Voltar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Teste de Som */}
            <button
              onClick={playAlertSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#170f30] hover:bg-[#231846] border border-[#3b2b73] text-xs font-semibold text-slate-300 transition-colors"
              title="Testar sinal sonoro de novo pedido"
            >
              <Play className="w-3.5 h-3.5 text-[#ec4899]" />
              <span className="hidden sm:inline">Testar Som</span>
            </button>

            {/* Toggle de Alerta Sonoro */}
            <button
              onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                soundAlertsEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
              title={soundAlertsEnabled ? 'Alerta sonoro ativo' : 'Alerta sonoro desativado'}
            >
              {soundAlertsEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Som Ativo</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Som Mudo</span>
                </>
              )}
            </button>

            {/* Informações do Usuário Autenticado */}
            {adminUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#170f30] border border-[#2e215e] text-xs">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white text-[10px] font-bold">
                  {adminUser.name?.charAt(0) || 'G'}
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white block leading-tight">
                    {adminUser.name || 'Gestor'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block leading-tight">
                    {adminUser.email}
                  </span>
                </div>
              </div>
            )}

            {/* Voltar para a Loja Pública */}
            <button
              onClick={() => setCurrentView('store')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#231749] hover:bg-[#2e1f5e] border border-[#3f2c7a] text-slate-200 text-xs font-semibold transition-all"
              title="Visualizar a loja como cliente"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#ec4899]" />
              <span className="hidden sm:inline">Ver Loja</span>
            </button>

            {/* Encerrar Sessão / Logout */}
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-sm"
              title="Encerrar sessão do painel administrativo"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 pt-1 border-t border-[#1b1236]">
          {/* Aba 1: Pedidos */}
          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'orders'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Gestor de Pedidos</span>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-bounce">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* Aba 2: Produtos & Cardápio */}
          <button
            onClick={() => setActiveAdminTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'products'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cardápio & Produtos</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#25184a] text-slate-300">
              {products.length}/200
            </span>
          </button>

          {/* Aba 3: Configurações */}
          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'settings'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Loja</span>
          </button>

          {/* Aba 4: Meu Plano & Consumo (Obrigatória NovaesWeb) */}
          <button
            onClick={() => setActiveAdminTab('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'plan'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Meu Plano & Consumo</span>
          </button>

          {/* Aba 5: Adicionais (Prompt 3 - Central de Adicionais) */}
          <button
            onClick={() => setActiveAdminTab('addons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'addons'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <Puzzle className="w-4 h-4 text-[#ec4899]" />
            <span>Adicionais</span>
          </button>

          {/* Aba 5: Comunicados do Master */}
          <button
            onClick={() => setActiveAdminTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'messages'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mensagens</span>
            {unreadMessagesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#ec4899] text-white animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Aba 6: Conexão Master */}
          <button
            onClick={() => setActiveAdminTab('connect')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeAdminTab === 'connect'
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
            }`}
          >
            <Globe className="w-4 h-4 text-[#8b2cff]" />
            <span>Conexão Master</span>
            {nxId && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#25184a] text-slate-300 font-mono">
                {nxId}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
