import React, { useState, useEffect } from 'react'
import {
  Puzzle,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight,
  Info,
  XCircle,
  Lock,
} from 'lucide-react'
import {
  AddonCatalogItem,
  AddonRequestItem,
  StoreAddonItem,
  fetchAddonCatalog,
  fetchStoreAddonRequests,
  fetchStoreAddons,
  submitAddonRequest,
  subscribeAddonsRealtime,
} from '../../services/addonService'
import { getStoredConnectIds } from '../../services/connectService'

export const AdminAddons: React.FC = () => {
  const { storeId, nxId } = getStoredConnectIds()
  const officialStoreId = storeId || '3b15518d-2edc-43d7-85ac-6ece2a82d40f'

  const [catalog, setCatalog] = useState<AddonCatalogItem[]>([])
  const [requests, setRequests] = useState<AddonRequestItem[]>([])
  const [storeAddons, setStoreAddons] = useState<StoreAddonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [activeTab, setActiveTab] = useState<'available' | 'requests' | 'active' | 'disabled'>('available')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Modal de solicitação
  const [requestingItem, setRequestingItem] = useState<AddonCatalogItem | null>(null)
  const [requestNotes, setRequestNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Carrega dados sob RLS
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    try {
      const [catData, reqData, addonData] = await Promise.all([
        fetchAddonCatalog(),
        fetchStoreAddonRequests(officialStoreId),
        fetchStoreAddons(officialStoreId),
      ])
      setCatalog(catData)
      setRequests(reqData)
      setStoreAddons(addonData)
    } finally {
      setLoading(false)
      if (isManualRefresh) setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscrição em Supabase Realtime com reconciliação periódica a cada 60s
    const unsubscribe = subscribeAddonsRealtime(officialStoreId, () => {
      loadData()
    })

    return () => {
      unsubscribe()
    }
  }, [officialStoreId])

  const handleOpenRequest = (item: AddonCatalogItem) => {
    setRequestingItem(item)
    setRequestNotes('')
    setActionError('')
    setActionSuccess('')
  }

  const handleConfirmRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestingItem) return

    setSubmitting(true)
    setActionError('')
    setActionSuccess('')

    try {
      const result = await submitAddonRequest(officialStoreId, requestingItem.id, requestNotes)
      if (!result.success) {
        throw new Error(result.error || 'Falha ao registrar a solicitação no Master.')
      }

      setActionSuccess(`Solicitação do recurso "${requestingItem.name}" enviada com sucesso! Status: Solicitado.`)
      setRequestingItem(null)
      loadData()
    } catch (err: any) {
      setActionError(err.message || 'Erro ao enviar solicitação.')
    } finally {
      setSubmitting(false)
    }
  }

  // Categorias únicas do catálogo
  const categories = ['all', ...Array.from(new Set(catalog.map((i) => i.category)))]

  // Filtragem de itens disponíveis (aqueles que ainda não têm solicitação pendente/aprovada ou contrato ativo)
  const requestedAddonIds = new Set(
    requests
      .filter((r) => r.status !== 'rejected' && r.status !== 'cancelled')
      .map((r) => r.addon_id)
  )
  const activeAddonIds = new Set(
    storeAddons.filter((sa) => sa.status === 'active').map((sa) => sa.addon_id)
  )

  const availableItems = catalog.filter(
    (item) => !requestedAddonIds.has(item.id) && !activeAddonIds.has(item.id)
  )

  const filteredAvailable =
    selectedCategory === 'all'
      ? availableItems
      : availableItems.filter((i) => i.category === selectedCategory)

  // Itens em preparo: approved mas sem store_addons.status === 'active'
  const inPreparationRequests = requests.filter(
    (r) => r.status === 'approved' && !activeAddonIds.has(r.addon_id)
  )

  const formatBRL = (val: number | null) => {
    if (val === null || val === undefined) return 'Sob consulta'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getBillingLabel = (type: string) => {
    switch (type) {
      case 'recurrent':
        return 'Mensalidade recorrente'
      case 'one_off':
        return 'Taxa única'
      case 'usage_based':
        return 'Por consumo/uso'
      case 'free':
        return 'Incluso'
      default:
        return 'Sob consulta'
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Topo da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#231846]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] text-xs font-bold border border-[#8b2cff]/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>NovaesWeb Connect — Catálogo Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Central de Adicionais & Recursos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore e solicite novos recursos para sua loja diretamente ao Painel Master.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#170f30] hover:bg-[#231846] border border-[#3b2b73] text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50"
            title="Atualizar catálogo e status em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8b2cff] ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Feedback de Ação */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Bloco Recolhível: Como Funciona & Requisitos (Prompt 3) */}
      <div className="rounded-2xl bg-[#130d26] border border-[#281c52] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1a1236] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#8b2cff]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Como funciona o fluxo de solicitação e ativação de adicionais?
            </span>
          </div>
          {showHowItWorks ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showHowItWorks && (
          <div className="p-5 pt-0 border-t border-[#231846] text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              O processo de expansão da sua loja segue a governança oficial da <b>NovaesWeb</b>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#181133] border border-[#2b1f58]">
                <b className="text-white block mb-1">1. Solicitação</b>
                <span className="text-slate-400 text-[11px]">
                  Você escolhe o item e envia a solicitação. Nenhum módulo é instalado ou cobrado de imediato.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#181133] border border-[#2b1f58]">
                <b className="text-white block mb-1">2. Análise Master</b>
                <span className="text-slate-400 text-[11px]">
                  O Master confere a compatibilidade e aprova comercialmente as condições.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#181133] border border-[#2b1f58]">
                <b className="text-amber-300 block mb-1">3. Em Preparo</b>
                <span className="text-slate-400 text-[11px]">
                  O aceite inicial define o status "Em preparo". O responsável técnico implementa o recurso no chat da loja.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#181133] border border-[#2b1f58]">
                <b className="text-emerald-400 block mb-1">4. Ativação Final</b>
                <span className="text-slate-400 text-[11px]">
                  Após revisão e check-in técnico, o Master concede a permissão ativa e o recurso é liberado no painel.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Abas Principais da Central de Adicionais */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#231846]">
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'available'
              ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
          }`}
        >
          <Puzzle className="w-4 h-4" />
          <span>Catálogo Disponível</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white">
            {availableItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Solicitações & Em Preparo</span>
          {requests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-black">
              {requests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Adicionais Ativos</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
            {storeAddons.filter((s) => s.status === 'active').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disabled')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'disabled'
              ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1236]'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Desativados / Recusados</span>
        </button>
      </div>

      {/* Conteúdo Aba 1: Catálogo Disponível */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Filtro por Categoria */}
          {categories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <span className="text-xs text-slate-400 mr-1">Filtrar:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#8b2cff] text-white'
                      : 'bg-[#181133] text-slate-400 hover:text-white border border-[#2b1f58]'
                  }`}
                >
                  {cat === 'all' ? 'Todas as Categorias' : cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-[#120c24] rounded-3xl border border-[#281c52]">
              <div className="inline-block w-6 h-6 border-2 border-[#8b2cff] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Consultando catálogo central oficial de adicionais...</p>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-[#120c24] border border-[#281c52] space-y-2">
              <Puzzle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhum adicional disponível no momento</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Todos os adicionais disponíveis já foram solicitados ou estão em processo de análise.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAvailable.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-[#120c26] border border-[#281c52] hover:border-[#8b2cff]/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40">
                        {item.category}
                      </span>
                      {item.is_new && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-[#ec4899] text-white animate-pulse">
                          NOVO
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Preço e Modelo de Cobrança */}
                    <div className="pt-2 border-t border-[#231846] space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-400">Investimento:</span>
                        <span className="text-sm font-black text-white font-['Outfit']">
                          {formatBRL(item.price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Cobrança:</span>
                        <span className="font-medium text-slate-300">{getBillingLabel(item.billing_type)}</span>
                      </div>
                      {item.setup_fee !== null && item.setup_fee > 0 && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Taxa de Implantação:</span>
                          <span className="text-amber-400">{formatBRL(item.setup_fee)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Solicitação */}
                  <button
                    type="button"
                    onClick={() => handleOpenRequest(item)}
                    className="w-full py-2.5 rounded-xl bg-[#1b1238] hover:bg-gradient-to-r hover:from-[#8b2cff] hover:to-[#ec4899] border border-[#37246b] hover:border-transparent text-white text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Solicitar ao Master</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ec4899] group-hover:text-white transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba 2: Solicitações & Em Preparo */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-[#120c24] border border-[#281c52] space-y-2">
              <Clock className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhuma solicitação enviada ainda</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Consulte a aba "Catálogo Disponível" para solicitar os adicionais e integrações desejadas para sua loja.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isApprovedWithoutActive = req.status === 'approved' && !activeAddonIds.has(req.addon_id)
                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#120c26] border border-[#281c52] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-['Outfit']">
                          {req.addon_name || 'Adicional Solicitado'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">({req.addon_code || req.addon_id})</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Solicitado em: {new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                        {req.notes && <span>• Nota: "{req.notes}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Mapeamento Rigoroso de Estados Oficiais */}
                      {req.status === 'pending' && (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Solicitado</span>
                        </span>
                      )}

                      {req.status === 'in_review' && (
                        <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                          <span>Em análise</span>
                        </span>
                      )}

                      {req.status === 'awaiting_confirmation' && (
                        <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                          <span>Aguardando confirmação</span>
                        </span>
                      )}

                      {/* Regra Prompt 3: approved sem store_addons.status = 'active' é "Em preparo" */}
                      {isApprovedWithoutActive && (
                        <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-[#ec4899]/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Em preparo</span>
                        </span>
                      )}

                      {req.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Recusado</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba 3: Adicionais Ativos */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {storeAddons.filter((sa) => sa.status === 'active').length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-[#120c24] border border-[#281c52] space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhum adicional ativo no momento</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Adicionais são ativados pelo Master somente após aprovação comercial, implementação técnica e check-in.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {storeAddons
                .filter((sa) => sa.status === 'active')
                .map((sa) => (
                  <div
                    key={sa.id}
                    className="p-5 rounded-2xl bg-[#120c26] border border-emerald-500/30 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{sa.addon_name || sa.addon_code}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ativado em: {sa.activated_at ? new Date(sa.activated_at).toLocaleDateString('pt-BR') : 'Recentemente'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ativo</span>
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba 4: Desativados / Recusados */}
      {activeTab === 'disabled' && (
        <div className="space-y-4">
          {requests.filter((r) => r.status === 'rejected').length === 0 &&
          storeAddons.filter((sa) => sa.status === 'suspended' || sa.status === 'disabled').length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-[#120c24] border border-[#281c52]">
              <p className="text-xs text-slate-400">Nenhum adicional suspenso ou solicitação recusada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .filter((r) => r.status === 'rejected')
                .map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-[#120c26] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{req.addon_name}</span>
                      <span className="text-slate-400 text-[11px]">
                        Motivo: {req.rejection_reason || 'Condições comerciais não atendidas no momento.'}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-300 font-bold border border-rose-500/30">
                      Recusado
                    </span>
                  </div>
                ))}

              {storeAddons
                .filter((sa) => sa.status === 'suspended' || sa.status === 'disabled')
                .map((sa) => (
                  <div
                    key={sa.id}
                    className="p-5 rounded-2xl bg-[#120c26] border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{sa.addon_name}</span>
                      <span className="text-slate-400 text-[11px]">
                        Situação: {sa.suspended_reason || 'Desativado pelo Master.'}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      Desativado
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Solicitação */}
      {requestingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#130d2a] border border-[#3b2773] shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd]">
                  {requestingItem.category}
                </span>
                <h3 className="text-xl font-black text-white font-['Outfit'] mt-1">
                  Solicitar: {requestingItem.name}
                </h3>
              </div>
              <button
                onClick={() => setRequestingItem(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {requestingItem.description}
            </p>

            <div className="p-4 rounded-2xl bg-[#1a1138] border border-[#2e1d5e] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Preço Estimado:</span>
                <b className="text-white">{formatBRL(requestingItem.price)}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Modelo de Cobrança:</span>
                <b className="text-slate-200">{getBillingLabel(requestingItem.billing_type)}</b>
              </div>
              {requestingItem.setup_fee !== null && requestingItem.setup_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxa de Implantação:</span>
                  <b className="text-amber-400">{formatBRL(requestingItem.setup_fee)}</b>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmRequest} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Observações ou Requisitos Específicos (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Ex: Gostaria de integrar com impressora térmica no balcão de Canoas..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#191036] border border-[#2c1d59] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#8b2cff]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#100a26] border border-[#231846] text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#8b2cff] shrink-0 mt-0.5" />
                <span>
                  O envio registrará uma solicitação pendente no Painel Master. Nenhuma cobrança ou alteração técnica ocorrerá até a aceitação formal das condições comerciais.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1e153f] hover:bg-[#281b52] text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-90 text-white text-xs font-extrabold shadow-neon-primary transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirmar Envio</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
