import React from 'react'
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle, Info, Lock } from 'lucide-react'
import { StoreOrderUsageWidget } from '../StoreOrderUsageWidget'
import { useStore } from '../../context/StoreContext'

export const AdminPlan: React.FC = () => {
  const { acceptedCountMonth } = useStore()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Título & Introdução */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] text-xs font-bold border border-[#8b2cff]/40 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Contrato Oficial NovaesWeb Business</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
          Meu Plano & Consumo de Pedidos
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Acompanhe com total transparência o consumo mensal da sua franquia de 340 pedidos aceitos.
        </p>
      </div>

      {/* WIDGET OFICIAL OBRIGATÓRIO DA NOVAESWEB */}
      <div>
        <StoreOrderUsageWidget localAcceptedCount={acceptedCountMonth} />
      </div>

      {/* Condições Comerciais & Regras do Plano Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8b2cff]" />
            <span>Condições Comerciais Contratadas</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-[#231846]">
              <span className="text-slate-400">Modelo Contratado:</span>
              <b className="text-white">Novaes Business (Catálogo & Delivery)</b>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#231846]">
              <span className="text-slate-400">Taxa de Criação do Projeto:</span>
              <b className="text-white">R$ 578,00</b>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#231846]">
              <span className="text-slate-400">Mensalidade Operacional:</span>
              <b className="text-[#f472b6]">R$ 190,00 / mês</b>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#231846]">
              <span className="text-slate-400">Franquia Mensal Inclusa:</span>
              <b className="text-white">340 pedidos aceitos/mês</b>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#231846]">
              <span className="text-slate-400">Tarifa de Excedente:</span>
              <b className="text-amber-400">R$ 0,20 por pedido aceito acima da franquia</b>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Rodadas de Revisão na Criação:</span>
              <b className="text-white">Até 2 rodadas inclusas</b>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#130d26] border border-[#281c52] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Regras de Auditoria e Zero Bloqueio</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <b>Apenas pedidos ACEITOS</b> consom a franquia. Pedidos rejeitados ou não respondidos não são contabilizados.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <b>Deduplicação Estável:</b> Cada pedido aceito é registrado exatamente uma única vez, prevenindo contagens duplicadas.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <b>Zero Bloqueio Garantido:</b> Atingir ou ultrapassar 340 pedidos NUNCA interrompe suas vendas. O excedente é tarifado de forma transparente no mês seguinte.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#8b2cff] flex-shrink-0 mt-0.5" />
              <span>
                <b>Privacidade Absoluta (Caderno 09):</b> Valores financeiros, faturamento ou dados de clientes finais nunca são enviados para a auditoria de franquias.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
