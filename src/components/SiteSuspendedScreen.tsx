import React from 'react'
import { Wrench, Clock, Megaphone, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react'
import { StoreAvailability } from '../services/storeAvailabilityService'

interface SiteSuspendedScreenProps {
  availability: StoreAvailability
  onAccessAdmin?: () => void
}

export const SiteSuspendedScreen: React.FC<SiteSuspendedScreenProps> = ({
  availability,
  onAccessAdmin,
}) => {
  const isMaintenance = availability.status === 'maintenance' || availability.blockMode === 'maintenance'
  const isSuspended = availability.status === 'suspended' || availability.blockMode === 'suspension'

  const statusTitle = isMaintenance
    ? 'Loja em Manutenção Programada'
    : isSuspended
    ? 'Acesso Temporariamente Suspenso'
    : 'Serviço Temporariamente Indisponível'

  const defaultMessage = isMaintenance
    ? 'Estamos realizando melhorias na infraestrutura e no cardápio para melhor atender você. Voltaremos em breve!'
    : isSuspended
    ? 'O acesso público a este delivery está temporariamente pausado. Entre em contato com o suporte para mais informações.'
    : 'Este estabelecimento está temporariamente indisponível para novos pedidos.'

  // Mensagem segura: estritamente texto plano
  const safeMessage = availability.message ? String(availability.message).trim() : defaultMessage

  // Previsão de retorno
  const returnDate = availability.returnAt ? new Date(availability.returnAt) : null
  const hasValidReturn = returnDate && !isNaN(returnDate.getTime())
  const formattedReturn = hasValidReturn
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo',
      }).format(returnDate)
    : null

  return (
    <div className="min-h-screen bg-[#07050d] text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background glow neon */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#8b2cff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Topo / Header com Acesso Lojista */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center font-black text-sm text-white">
            N
          </div>
          <span className="font-black tracking-tight text-white font-['Outfit'] text-base">
            NovaesWeb <span className="text-xs text-slate-400 font-normal">Connect</span>
          </span>
        </div>

        {onAccessAdmin && (
          <button
            onClick={onAccessAdmin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#140d29] hover:bg-[#201542] border border-[#3b2b73] text-xs font-semibold text-slate-300 transition-colors"
          >
            <span>Acesso do Proprietário</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ec4899]" />
          </button>
        )}
      </div>

      {/* Card Central de Bloqueio */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10">
        <div className="p-8 rounded-3xl bg-[#110a24]/90 border border-[#2b1f58] shadow-2xl backdrop-blur-md space-y-6 text-center">
          {/* Badge de Status */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            {isMaintenance ? (
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{isMaintenance ? 'Manutenção Ativa' : 'Aviso Administrativo'}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
              {statusTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Açaí do Rei • Canoas - RS
            </p>
          </div>

          {/* Comunicado da Loja */}
          <div className="p-4 rounded-2xl bg-[#170e30] border border-[#332363] text-left flex items-start gap-3">
            <Megaphone className="w-4 h-4 text-[#ec4899] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Comunicado Oficial:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {safeMessage}
              </p>
            </div>
          </div>

          {/* Previsão de Retorno */}
          {hasValidReturn && (
            <div className="p-4 rounded-2xl bg-[#0e081e] border border-cyan-500/30 text-left flex items-start gap-3">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-0.5">
                  Previsão de Retorno:
                </span>
                <p className="text-xs text-slate-200 capitalize">
                  {formattedReturn}
                </p>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500">
            Agradecemos a compreensão. Pedidos temporariamente pausados.
          </div>
        </div>
      </div>

      {/* Rodapé Seguro */}
      <div className="max-w-4xl w-full mx-auto text-center relative z-10 pt-4">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-[#8b2cff]" />
          <span>NovaesWeb Connect • Proteção Administrativa em Tempo Real</span>
        </div>
      </div>
    </div>
  )
}
