import React from 'react'
import { MapPin, Clock, Phone, ShieldCheck, Crown } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export const Footer: React.FC = () => {
  const { config, setCurrentView } = useStore()

  return (
    <footer className="bg-[#080510] border-t border-[#231846] pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1b1236]">
          {/* Coluna 1: Marca */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-amber-300">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white uppercase font-['Outfit']">
                Açaí do Rei
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              O açaí mais aveludado e saboroso de Canoas - RS. Selecionamos as melhores frutas e complementos para a sua melhor experiência.
            </p>
          </div>

          {/* Coluna 2: Atendimento e Localização */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              Localização & Retirada
            </h4>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-[#ec4899] flex-shrink-0 mt-0.5" />
              <span>{config.address}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-[#8b2cff] flex-shrink-0" />
              <span>WhatsApp: {config.phone}</span>
            </div>
          </div>

          {/* Coluna 3: Horários */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              Horários de Atendimento
            </h4>
            <div className="flex items-start gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Segunda a Sábado</p>
                <p>18h00 às 23h30</p>
                <p className="text-slate-500 mt-1">Domingos: Fechado para descanso</p>
              </div>
            </div>
          </div>

          {/* Coluna 4: Painel do Lojista */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              Área Administrativa
            </h4>
            <p className="text-slate-400">
              Gestão de pedidos em tempo real, controle de cardápio e acompanhamento de franquia.
            </p>
            <button
              onClick={() => {
                setCurrentView('admin')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1236] hover:bg-[#281b52] border border-[#3b2b73] text-white font-bold text-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#8b2cff]" />
              <span>Entrar no Painel do Lojista</span>
            </button>
          </div>
        </div>

        {/* Rodapé Comercial NovaesWeb e Controle de Versão (v5.2) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Copyright e Versão */}
          <p className="novaesweb-copyright text-center sm:text-left text-slate-400">
            © {new Date().getFullYear()} {config.name} • Canoas - RS. Todos os direitos reservados. • <strong className="text-slate-300 font-bold">v5.2</strong>
          </p>

          {/* Assinatura Institucional com Coração e Link Oficial */}
          <div className="novaesweb-footer-signature flex items-center justify-center gap-1.5 text-slate-400">
            <span>Feito com <span className="novaesweb-heart inline-block hover:scale-125 transition-transform duration-200 cursor-default animate-pulse select-none" title="Amor pelo que fazemos">❤️</span> por </span>
            <a
              href="https://novaesweb.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="novaesweb-brand-link font-bold text-[#c4b5fd] hover:text-[#ec4899] transition-colors underline decoration-[#8b2cff]/40 underline-offset-4"
            >
              NovaesWeb
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
