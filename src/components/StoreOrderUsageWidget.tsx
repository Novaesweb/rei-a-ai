import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Layers,
  Calendar,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  HelpCircle,
  FileText,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getStoredConnectIds } from '../services/connectService'
import {
  getSaoPauloCompetence,
  getSaoPauloDayKey,
  getSaoPauloCompetenceLabel,
} from '../lib/novaeswebUsage'

export interface DailyUsageItem {
  dayLabel: string
  count: number
}

export interface VoidedEventItem {
  order_ref: string
  void_reason: string
  voided_at: string
}

export interface StoreOrderUsageData {
  store_name: string
  store_id: string
  nx_id: string
  competence: string
  competence_label: string
  plano_cadastrado: string | null
  plano_confirmado: string | null
  confirmacao_plano: string
  franquia_aprovada: number | null
  tarifa_excedente_aprovada: number | null
  accepted_total: number
  voided_count: number
  accepted_billable: number
  dailyBreakdown: DailyUsageItem[]
  voidedEvents: VoidedEventItem[]
  hasTermsConfirmed: boolean
}

interface StoreOrderUsageWidgetProps {
  localAcceptedCount?: number
}

export function StoreOrderUsageWidget({ localAcceptedCount }: StoreOrderUsageWidgetProps) {
  const [data, setData] = useState<StoreOrderUsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'consumption' | 'daily' | 'voids' | 'contract'>('consumption')

  useEffect(() => {
    async function loadUsage() {
      try {
        const { storeId, nxId, siteName } = getStoredConnectIds()
        const officialStoreId = storeId || '3b15518d-2edc-43d7-85ac-6ece2a82d40f'
        const officialNxId = nxId || 'NX-3B15518D2EDC43D785AC6ECE2A82D40F'

        // Competência oficial no fuso America/Sao_Paulo (UTC-3)
        const currentCompetence = getSaoPauloCompetence(new Date())
        const competenceLabel = getSaoPauloCompetenceLabel(currentCompetence)

        let acceptedTotal = localAcceptedCount ?? 0
        let voidedCount = 0
        let dailyMap: Record<string, number> = {}
        let voidedList: VoidedEventItem[] = []

        // Dados contratuais (Conforme o contexto administrativo do Master)
        let planoCadastrado: string | null = null
        let planoConfirmado: string | null = null
        let confirmacaoPlano = 'Plano ainda não confirmado contratualmente'
        let franquiaAprovada: number | null = null
        let tarifaExcedenteAprovada: number | null = null

        // 1. Tenta consulta à view analítica store_order_usage_monthly com RLS
        try {
          const { data: monthlyView, error: viewError } = await supabase
            .from('store_order_usage_monthly')
            .select('*')
            .eq('store_id', officialStoreId)
            .eq('competence', currentCompetence)
            .maybeSingle()

          if (!viewError && monthlyView) {
            if (typeof monthlyView.accepted_count === 'number') {
              acceptedTotal = Math.max(acceptedTotal, monthlyView.accepted_count)
            }
            if (typeof monthlyView.voided_count === 'number') {
              voidedCount = monthlyView.voided_count
            }
            if (monthlyView.plan_code) {
              planoCadastrado = monthlyView.plan_code
            }
            if (typeof monthlyView.franchise_orders === 'number') {
              franquiaAprovada = monthlyView.franchise_orders
            }
            if (typeof monthlyView.overage_tariff === 'number') {
              tarifaExcedenteAprovada = monthlyView.overage_tariff
            }
            if (monthlyView.is_confirmed) {
              planoConfirmado = monthlyView.plan_code
              confirmacaoPlano = 'Contrato confirmado'
            }
          }
        } catch {
          // View não acessível ou sem registros ainda
        }

        // 2. Consulta eventos individuais em store_order_usage_events para detalhar dias e anulações
        try {
          const { data: events, error } = await supabase
            .from('store_order_usage_events')
            .select('occurred_at, event_type, is_voided, void_reason, voided_at, order_ref')
            .eq('store_id', officialStoreId)
            .eq('competence', currentCompetence)

          if (!error && Array.isArray(events)) {
            const acceptedEvents = events.filter((e) => e.event_type === 'accepted')
            acceptedTotal = Math.max(acceptedTotal, acceptedEvents.length)

            const voided = acceptedEvents.filter((e) => e.is_voided)
            voidedCount = Math.max(voidedCount, voided.length)

            voidedList = voided.map((v) => ({
              order_ref: v.order_ref,
              void_reason: v.void_reason || 'Anulação administrativa aprovada pelo Master',
              voided_at: v.voided_at || v.occurred_at,
            }))

            // Popula mapa diário no fuso America/Sao_Paulo
            acceptedEvents.forEach((ev) => {
              const dayKey = getSaoPauloDayKey(ev.occurred_at)
              dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1
            })
          }
        } catch (supabaseErr) {
          console.warn('[NovaesWeb] Aviso ao consultar eventos de pedidos:', supabaseErr)
        }

        // Se localmente temos contagem e mapa vazio, projeta dia atual em SP
        if (Object.keys(dailyMap).length === 0 && acceptedTotal > 0) {
          const todayKey = getSaoPauloDayKey(new Date())
          dailyMap[todayKey] = acceptedTotal
        }

        // 3. Consulta managed_sites sob RLS para obter identificação administrativa da loja
        try {
          const { data: siteRecord } = await supabase
            .from('managed_sites')
            .select('name, nx_id, plan_code')
            .eq('id', officialStoreId)
            .maybeSingle()

          if (siteRecord) {
            if (siteRecord.plan_code) {
              planoCadastrado = siteRecord.plan_code
            }
          }
        } catch {
          // Fallback seguro
        }

        // Contagem faturável deduz anulações técnicas aprovadas
        const acceptedBillable = Math.max(0, acceptedTotal - voidedCount)
        const hasTermsConfirmed = franquiaAprovada !== null && tarifaExcedenteAprovada !== null

        const dailyBreakdown: DailyUsageItem[] = Object.entries(dailyMap).map(([dayLabel, count]) => ({
          dayLabel,
          count,
        }))

        setData({
          store_name: siteName || 'Açaí do Rei',
          store_id: officialStoreId,
          nx_id: officialNxId,
          competence: currentCompetence,
          competence_label: competenceLabel,
          plano_cadastrado: planoCadastrado,
          plano_confirmado: planoConfirmado,
          confirmacao_plano: confirmacaoPlano,
          franquia_aprovada: franquiaAprovada,
          tarifa_excedente_aprovada: tarifaExcedenteAprovada,
          accepted_total: acceptedTotal,
          voided_count: voidedCount,
          accepted_billable: acceptedBillable,
          dailyBreakdown,
          voidedEvents: voidedList,
          hasTermsConfirmed,
        })
      } catch (err) {
        console.error('Erro ao carregar demonstrativo da franquia:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsage()
  }, [localAcceptedCount])

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-[#120c24] rounded-3xl border border-[#281c52]">
        <div className="inline-block w-6 h-6 border-2 border-[#8b2cff] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Carregando demonstrativo oficial da franquia (America/Sao_Paulo)...</p>
      </div>
    )
  }

  if (!data) return null

  const {
    hasTermsConfirmed,
    franquia_aprovada: franchise,
    tarifa_excedente_aprovada: tariff,
    accepted_billable: accepted,
    accepted_total,
    voided_count,
    competence,
    competence_label,
  } = data

  const pct = franchise ? Math.min(Math.round((accepted / franchise) * 100), 100) : 0
  const realPct = franchise ? Math.round((accepted / franchise) * 100) : 0
  const remaining = franchise ? Math.max(0, franchise - accepted) : null
  const overage = franchise && accepted > franchise ? accepted - franchise : 0
  const overageFee = tariff !== null ? overage * tariff : null

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="bg-[#120c26] border border-[#2b1f58] rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl max-w-4xl mx-auto space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Topo do Widget: Identidade e Competência Oficial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#231846]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white shadow-neon-primary shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white font-['Outfit']">
                Consumo de Pedidos & Franquia
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40">
                {data.nx_id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>Competência:</span>
              <b className="text-slate-200">{competence_label}</b>
              <span className="text-slate-500 font-mono">({competence})</span>
              <span className="text-[11px] text-slate-500">• Fuso America/Sao_Paulo</span>
            </p>
          </div>
        </div>

        {/* Status do Contrato / Franquia */}
        <div className="flex items-center gap-2">
          {!hasTermsConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Plano ainda não confirmado contratualmente</span>
            </span>
          ) : overage > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Zero Bloqueio Ativo (+{overage} excedentes)</span>
            </span>
          ) : realPct >= 100 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Franquia Atingida (100%)</span>
            </span>
          ) : realPct >= 80 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Atenção: 80% Consumido ({realPct}%)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consumo Normal ({realPct}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* Alerta Específico se Faltar Termos Aprovados do Master (Regra Prompt 4) */}
      {!hasTermsConfirmed && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Dados insuficientes para cobrança</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            As condições contratuais do plano (franquia aprovada e tarifa de excedente) ainda não foram formalizadas pelo Master para a competência <b>{competence}</b>. A contagem técnica de pedidos aceitos e deduplicação está plenamente ativa e auditada, mas nenhuma cobrança de excedente ou tarifa presumida é aplicada até a confirmação contratual.
          </p>
        </div>
      )}

      {/* Alertas nos limites de 80% e 100% da franquia quando confirmada */}
      {hasTermsConfirmed && franchise && (
        <>
          {realPct >= 100 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <b className="text-white block font-bold mb-0.5">
                  100% da Franquia Atingida — Garantia de Zero Bloqueio
                </b>
                Seus novos pedidos <b>continuam sendo aceitos normalmente</b> sem interrupção de vendas. Os pedidos aceitos acima da franquia (+{overage}) serão tarifados em {tariff ? formatBRL(tariff) : 'R$ 0,20'} por pedido e cobrados na fatura do mês seguinte.
              </div>
            </div>
          )}

          {realPct >= 80 && realPct < 100 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <b className="text-amber-300 block font-bold mb-0.5">
                  Atenção: 80% da Franquia Consumida
                </b>
                Você aceitou {accepted} de {franchise} pedidos ({realPct}%). Restam {remaining} pedidos inclusos na sua franquia deste mês.
              </div>
            </div>
          )}
        </>
      )}

      {/* Barra de Progresso Visual */}
      {franchise && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Progresso na Franquia do Mês</span>
            <span className="font-bold text-slate-200">
              {accepted} de {franchise} pedidos ({realPct}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#181136] overflow-hidden p-0.5 border border-[#2b1f58]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overage > 0
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : realPct >= 80
                  ? 'bg-gradient-to-r from-[#8b2cff] to-amber-500'
                  : 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899]'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid de 4 Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Franquia */}
        <div className="p-4 rounded-2xl bg-[#160f33] border border-[#2a1d56] space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Franquia Aprovada</span>
          <div className="text-xl font-black text-white font-['Outfit']">
            {franchise !== null ? franchise : 'Em aprovação'}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {franchise ? 'pedidos aceitos/mês' : 'Aguardando Master'}
          </span>
        </div>

        {/* Card 2: Aceites Faturáveis */}
        <div className="p-4 rounded-2xl bg-[#160f33] border border-[#2a1d56] space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Aceites Não Anulados</span>
          <div className="text-xl font-black text-[#c4b5fd] font-['Outfit']">
            {accepted}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {voided_count > 0 ? `${accepted_total} total (-${voided_count} anulados)` : 'Contabilizados'}
          </span>
        </div>

        {/* Card 3: Saldo Restante */}
        <div className="p-4 rounded-2xl bg-[#160f33] border border-[#2a1d56] space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Saldo Restante</span>
          <div className={`text-xl font-black font-['Outfit'] ${remaining && remaining > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {franchise !== null ? (remaining ?? 0) : '—'}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {franchise ? 'pedidos inclusos' : 'Sem franquia fixada'}
          </span>
        </div>

        {/* Card 4: Excedente & Tarifa */}
        <div className="p-4 rounded-2xl bg-[#160f33] border border-[#2a1d56] space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">
            Excedente Estimado
          </span>
          <div className={`text-xl font-black font-['Outfit'] ${overage > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {overage > 0 ? `+${overage}` : '0'}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {tariff !== null && overage > 0
              ? `${formatBRL(overageFee || 0)} no próx. ciclo`
              : tariff === null
              ? 'Tarifa não contratada'
              : 'Sem custo extra'}
          </span>
        </div>
      </div>

      {/* Abas Secundárias: Histórico Diário | Anulações Auditadas | Termos Master */}
      <div className="pt-2">
        <div className="flex items-center gap-2 border-b border-[#231846] pb-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('consumption')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'consumption'
                ? 'bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Regras & Zero Bloqueio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'daily'
                ? 'bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Histórico Diário ({data.dailyBreakdown.length} dias)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voids')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'voids'
                ? 'bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Anulações Técnicas ({voided_count})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'contract'
                ? 'bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auditoria & Termos do Master
          </button>
        </div>

        {/* Conteúdo da Aba 1: Regras e Zero Bloqueio */}
        {activeTab === 'consumption' && (
          <div className="mt-4 p-4 rounded-2xl bg-[#160f33]/80 border border-[#2a1d56] flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#f472b6] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <b className="text-white block font-bold mb-1">
                Garantia de Venda Contínua (Zero Bloqueio NovaesWeb)
              </b>
              Seu delivery <b>nunca é interrompido ou bloqueado</b> por atingir a franquia. Caso atinja ou ultrapasse o limite de pedidos aceitos, novos pedidos continuam chegando e sendo aceitos normalmente. O excedente é cobrado apenas no ciclo de faturamento seguinte. Pedidos rejeitados ou cancelados antes do aceite nunca consomem sua franquia.
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Histórico Diário */}
        {activeTab === 'daily' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-400">
              Distribuição de pedidos aceitos por dia na competência oficial <b>{competence}</b> (fuso America/Sao_Paulo):
            </p>
            {data.dailyBreakdown.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {data.dailyBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#181136] border border-[#2c1f59] text-center"
                  >
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {item.dayLabel}
                    </span>
                    <strong className="text-base font-black text-white font-['Outfit'] block mt-0.5">
                      {item.count}
                    </strong>
                    <span className="text-[9px] text-[#ec4899] font-medium">
                      {item.count === 1 ? 'pedido aceito' : 'pedidos aceitos'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-4 bg-[#181136] rounded-xl border border-[#281c52]">
                Nenhum pedido aceito registrado nesta competência até o momento.
              </p>
            )}
          </div>
        )}

        {/* Conteúdo da Aba 3: Anulações Técnicas */}
        {activeTab === 'voids' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-400">
              Pedidos com anulação técnica aprovada pelo Master são descontados da franquia faturável (<code className="text-amber-300">is_voided = true</code>), preservando o registro para auditoria:
            </p>
            {data.voidedEvents.length > 0 ? (
              <div className="space-y-2">
                {data.voidedEvents.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#181136] border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono font-bold text-amber-300 block">
                        Pedido Ref: {v.order_ref}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Motivo da Anulação: {v.void_reason}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(v.voided_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#181136] border border-[#281c52] text-xs text-slate-500 italic">
                Nenhuma anulação técnica registrada para esta loja. Todos os aceites são válidos.
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da Aba 4: Auditoria & Termos do Master */}
        {activeTab === 'contract' && (
          <div className="mt-4 p-5 rounded-2xl bg-[#160f33] border border-[#2a1d56] space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-white text-sm pb-2 border-b border-[#231846]">
              <FileText className="w-4 h-4 text-[#8b2cff]" />
              <span>Relatório Técnico de Auditoria & Conformidade Contratual</span>
            </div>
            <p className="leading-relaxed">
              <b>Segurança & Isolamento (Prompt 4):</b> Os termos de competência em <code className="text-[#c4b5fd]">master_order_competence_terms</code> são de governança exclusiva do Master e não são acessíveis diretamente pelo cliente da loja.
            </p>
            <div className="p-3 rounded-xl bg-[#100a26] border border-[#231846] space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">Identidade da Loja: <span className="text-white">{data.store_name}</span></div>
              <div className="text-slate-400">UUID Store ID: <span className="text-white">{data.store_id}</span></div>
              <div className="text-slate-400">NX ID Oficial: <span className="text-white">{data.nx_id}</span></div>
              <div className="text-slate-400">Status Contratual: <span className="text-amber-400">{data.confirmacao_plano}</span></div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <b>Pendência Registrada ao Master:</b> Disponibilizar a RPC restrita e autorizada <code className="text-white">public.store_monthly_statement(p_store_id uuid, p_competence text)</code> sob RLS, que permite retornar a franquia e tarifa aprovadas sem expor tabelas globais da administração.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
