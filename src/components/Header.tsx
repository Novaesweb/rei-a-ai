import React from 'react'
import { ShoppingBag, Clock, MapPin, ShieldCheck, Crown } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export const Header: React.FC = () => {
  const {
    config,
    isStoreOpenNow,
    cartItemCount,
    cartSubtotal,
    setIsCartDrawerOpen,
    setCurrentView,
    trackedOrderId,
  } = useStore()

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <header className="sticky top-0 z-40 bg-[#0a0714]/90 backdrop-blur-md border-b border-[#281c52]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] shadow-neon-primary">
              <Crown className="w-7 h-7 text-amber-300 drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-['Outfit']">
                  Açaí do Rei
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#8b2cff]/30 to-[#ec4899]/30 text-[#f472b6] border border-[#ec4899]/40">
                  PREMIUM
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ec4899]" />
                  {config.city} - {config.state}
                </span>
                <span>•</span>
                {/* Status Aberto / Fechado */}
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isStoreOpenNow
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    }`}
                  />
                  <span className={isStoreOpenNow ? 'text-emerald-400' : 'text-rose-400'}>
                    {isStoreOpenNow ? 'Aberto Agora' : 'Fechado'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-3">
            {/* Atalho Painel Lojista */}
            <button
              onClick={() => setCurrentView('admin')}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#16102e] hover:bg-[#231846] border border-[#3b2b73] rounded-xl transition-all"
              title="Acessar Gestor de Pedidos do Lojista"
            >
              <ShieldCheck className="w-4 h-4 text-[#8b2cff]" />
              Painel do Lojista
            </button>

            {/* Status do Pedido se houver ativo */}
            {trackedOrderId && (
              <button
                onClick={() => {
                  const el = document.getElementById('order-tracker-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-pulse"
              >
                <Clock className="w-4 h-4" />
                Pedido #{trackedOrderId}
              </button>
            )}

            {/* Carrinho Flutuante */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-95 text-white font-bold text-sm shadow-neon-primary transition-transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">
                {cartItemCount === 0 ? 'Carrinho' : formatBRL(cartSubtotal)}
              </span>
              {cartItemCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black bg-white text-[#8b2cff] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
