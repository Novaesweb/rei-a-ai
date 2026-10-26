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
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { getStoredConnectIds } from '../services/connectService'

export interface DailyUsageItem {
  dayLabel: string
  count: number
}

export interface StoreOrderUsageData {
  store_name: string
  nx_id?: string
  plan_name: string
  plan_code: string
  competence_label: string
  franchise_orders: number | null
  accepted_count: number
  overage_tariff: number
  dailyBreakdown: DailyUsageItem[]
}

interface StoreOrderUsageWidgetProps {
  localAcceptedCount?: number
}

export function StoreOrderUsageWidget({ localAcceptedCount }: StoreOrderUsageWidgetProps) {
  const [data, setData] = useState<StoreOrderUsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUsage() {
      try {
        const { storeId: detectedStoreId, nxId: detectedNxId, siteName } = getStoredConnectIds()
        const storeId = detectedStoreId || 'acai-do-rei-canoas'
        const storeNxId = detectedNxId || 'NX-ACAIDOREI'

        const currentCompetence = new Date().toISOString().slice(0, 7) // "YYYY-MM"
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]
        const [year, month] = currentCompetence.split('-')
        const competenceLabel = `${monthNames[Number(month) - 1]} de ${year}`

        let acceptedCount = localAcceptedCount ?? 0
        let dailyMap: Record<string, number> = {}

        // 1. Tenta consulta à view analítica oficial store_order_usage_monthly
        try {
          const { data: monthlyView, error: viewError } = await supabase
            .from('store_order_usage_monthly')
            .select('accepted_count, franchise_orders, overage_count')
            .eq('store_id', storeId)
            .eq('competence', currentCompetence)
            .maybeSingle()

          if (!viewError && monthlyView && typeof monthlyView.accepted_count === 'number') {
            acceptedCount = Math.max(acceptedCount, monthlyView.accepted_count)
          }
        } catch {
          // Fallback para contagem direta
        }

        // 2. Tenta consulta ao store_order_usage_events para detalhar diário
        try {
          const { data: events, error } = await supabase
            .from('store_order_usage_events')
            .select('occurred_at')
            .eq('store_id', storeId)
            .eq('competence', currentCompetence)
            .eq('event_type', 'accepted')

          if (!error && Array.isArray(events)) {
            acceptedCount = Math.max(acceptedCount, events.length)
            events.forEach((ev) => {
              const d = new Date(ev.occurred_at)
              const dayKey = `${String(d.getDate()).padStart(2, '0')}/${month}`
              dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1
            })
          }
        } catch (supabaseErr) {
          console.warn('[NovaesWeb] Aviso ao sincronizar contador Supabase:', supabaseErr)
        }

        // Se estiver em modo local/demonstrativo e sem eventos remotos, simula histórico coerente
        if (Object.keys(dailyMap).length === 0 && acceptedCount > 0) {
          const today = new Date().getDate()
          const todayKey = `${String(today).padStart(2, '0')}/${month}`
          dailyMap[todayKey] = acceptedCount
        }

        // 3. Consulta dados do plano no managed_sites
        let storeName = siteName || 'Açaí do Rei'
        let planCode = 'NOVAES_BUSINESS'

        try {
          const { data: storeInfo } = await supabase
            .from('managed_sites')
            .select('name, nx_id, plan_code')
            .eq('id', storeId)
            .maybeSingle()

          if (storeInfo?.name) storeName = storeInfo.name
          if (storeInfo?.plan_code) planCode = storeInfo.plan_code
        } catch {
          // Fallback seguro
        }

        const isPremium = planCode === 'NOVAES_PREMIUM'
        const isStart = planCode === 'NOVAES_START'

        const dailyBreakdown: DailyUsageItem[] = Object.entries(dailyMap).map(([dayLabel, count]) => ({
          dayLabel,
          count,
        }))

        setData({
          store_name: storeName,
          nx_id: storeNxId,
          plan_name: isStart ? 'Novaes Start' : isPremium ? 'Novaes Premium' : 'Novaes Business',
          plan_code: planCode,
          competence_label: competenceLabel,
          franchise_orders: isStart ? null : isPremium ? 750 : 340,
          accepted_count: acceptedCount,
          overage_tariff: isPremium ? 0.15 : 0.20,
          dailyBreakdown,
        })
      } catch (err) {
        console.error('Erro ao carregar consumo de pedidos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUsage()
  }, [localAcceptedCount])

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
        Carregando demonstrativo da franquia de pedidos...
      </div>
    )
  }

  if (!data) return null

  const franchise = data.franchise_orders
  const accepted = data.accepted_count
  const pct = franchise ? Math.min(Math.round((accepted / franchise) * 100), 100) : 0
  const realPct = franchise ? Math.round((accepted / franchise) * 100) : 0
  const remaining = franchise ? Math.max(0, franchise - accepted) : null
  const overage = franchise && accepted > franchise ? accepted - franchise : 0
  const overageFee = overage * data.overage_tariff

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(22, 27, 46, 0.95), rgba(15, 19, 36, 0.98))',
      border: '1px solid rgba(139, 92, 246, 0.25)',
      borderRadius: 16,
      padding: 24,
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Consumo de Pedidos</h3>
              <span style={{
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#c4b5fd',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid rgba(139, 92, 246, 0.4)',
              }}>
                {data.plan_name}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Competência: <b>{data.competence_label}</b> · Franquia de pedidos aceitos
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {franchise === null ? (
            <span style={{ background: '#334155', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}>
              Sem franquia de delivery
            </span>
          ) : overage > 0 ? (
            <span style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(239, 68, 68, 0.4)',
            }}>
              <AlertCircle size={14} /> Zero Bloqueio Ativo (+{overage})
            </span>
          ) : realPct >= 100 ? (
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fcd34d',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}>
              <AlertTriangle size={14} /> Franquia Atingida (100%)
            </span>
          ) : realPct >= 80 ? (
            <span style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <AlertTriangle size={14} /> Atenção à Franquia ({realPct}%)
            </span>
          ) : (
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#86efac',
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}>
              Consumo Normal ({realPct}%)
            </span>
          )}
        </div>
      </div>

      {franchise !== null ? (
        <>
          {/* Barra de Progresso */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
              <span>Progresso do período</span>
              <span>{accepted} de {franchise} pedidos ({realPct}%)</span>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              height: 12,
              borderRadius: 999,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: overage > 0
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : realPct >= 80
                  ? 'linear-gradient(90deg, #8b5cf6, #f59e0b)'
                  : 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                borderRadius: 999,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* Cards de Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Franquia Inclusa</span>
              <strong style={{ fontSize: 18, color: '#f8fafc' }}>{franchise}</strong>
              <small style={{ fontSize: 11, color: '#64748b', display: 'block' }}>pedidos/mês</small>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Pedidos Aceitos</span>
              <strong style={{ fontSize: 18, color: '#8b5cf6' }}>{accepted}</strong>
              <small style={{ fontSize: 11, color: '#64748b', display: 'block' }}>contabilizados</small>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Saldo Restante</span>
              <strong style={{ fontSize: 18, color: remaining && remaining > 0 ? '#22c55e' : '#94a3b8' }}>
                {remaining ?? 0}
              </strong>
              <small style={{ fontSize: 11, color: '#64748b', display: 'block' }}>pedidos livres</small>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>Excedente ({formatBRL(data.overage_tariff)}/ped)</span>
              <strong style={{ fontSize: 18, color: overage > 0 ? '#ef4444' : '#94a3b8' }}>
                +{overage}
              </strong>
              <small style={{ fontSize: 11, color: '#64748b', display: 'block' }}>
                {overage > 0 ? formatBRL(overageFee) : 'Sem cobrança extra'}
              </small>
            </div>
          </div>

          {/* Histórico Diário de Pedidos Aceitos */}
          {data.dailyBreakdown.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 12,
              padding: 14,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#c4b5fd', marginBottom: 10 }}>
                <Calendar size={14} /> Histórico Diário de Pedidos Aceitos na Competência
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.dailyBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.25)',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 11,
                      color: '#e2e8f0',
                    }}
                  >
                    <span>{item.dayLabel}: </span>
                    <b style={{ color: '#ec4899' }}>{item.count} {item.count === 1 ? 'pedido' : 'pedidos'}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banner de Proteção Comercial: Zero Bloqueio */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <Sparkles size={18} color="#c4b5fd" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
              <b style={{ color: '#fff' }}>Garantia de Venda Contínua (Zero Bloqueio NovaesWeb):</b>
              <br />
              Seu delivery <b>nunca é interrompido</b>. Caso sua franquia termine, novos pedidos continuarão entrando normalmente.
              Os pedidos adicionais são tarifados em apenas <b>{formatBRL(data.overage_tariff)} por pedido aceito</b> no fechamento do mês.
              Pedidos rejeitados ou cancelados antes do aceite <b>não consomem</b> sua franquia.
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: 13, color: '#94a3b8' }}>
          O plano <b>Novaes Start</b> é institucional e não possui franquia de delivery. Caso necessite receber pedidos online com carrinho e painel de pedidos, solicite o upgrade para o plano <b>Novaes Business</b> ou <b>Novaes Premium</b>.
        </div>
      )}
    </div>
  )
}
