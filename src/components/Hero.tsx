import React from 'react'
import { Sparkles, Clock, Truck, ShieldCheck, Flame } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export const Hero: React.FC = () => {
  const { config, isStoreOpenNow } = useStore()

  return (
    <div className="relative overflow-hidden pt-6 pb-10 sm:py-12 bg-gradient-to-b from-[#130d26]/80 via-[#0a0714] to-[#0a0714] border-b border-[#281c52]/60">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8b2cff]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#ec4899]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Textos */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e153b] border border-[#3b2b73] text-xs font-semibold text-[#f472b6]">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Açaiteria Artesanal de Alto Padrão em {config.city}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit'] leading-tight">
              O melhor em <span className="bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f472b6] bg-clip-text text-transparent">açaí</span> da sua região
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Textura aveludada sem cristais de gelo, frutas frescas selecionadas diariamente e dezenas de adicionais especiais para você montar o açaí perfeito.
            </p>

            {/* Destaques Rápidos */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#150f2e] border border-[#2b1f58]">
                <Clock className="w-4 h-4 text-[#ec4899]" />
                <span>Seg a Sáb 18h às 23h30</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#150f2e] border border-[#2b1f58]">
                <Truck className="w-4 h-4 text-[#8b2cff]" />
                <span>Delivery Rápido & Retirada</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#150f2e] border border-[#2b1f58]">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Açaí 100% Puro e Cremoso</span>
              </div>
            </div>
          </div>

          {/* Imagem Hero Promocional */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] opacity-70 blur-xl group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative rounded-3xl overflow-hidden border border-[#3e2c7a] bg-[#120d29] shadow-2xl">
                <img
                  src="/images/acai-strawberry-blueberry.jpg"
                  alt="Açaí do Rei Especial"
                  className="w-full h-64 sm:h-72 object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0714] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                      Destaque da Realeza
                    </span>
                    <h3 className="text-lg font-bold text-white">Tigela Morango & Nutella</h3>
                  </div>
                  <span className="px-3 py-1 text-sm font-extrabold text-white bg-gradient-to-r from-[#8b2cff] to-[#ec4899] rounded-xl shadow">
                    R$ 27,90
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
