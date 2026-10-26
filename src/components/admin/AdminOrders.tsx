import React, { useState } from 'react'
import {
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Store,
  Printer,
  XCircle,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Order, OrderStatus } from '../../types'
import { ThermalReceiptModal } from './ThermalReceiptModal'

export const AdminOrders: React.FC = () => {
  const {
    orders,
    acceptOrder,
    updateOrderStatus,
    rejectOrder,
    config,
  } = useStore()

  const [activeStatusFilter, setActiveStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null)
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null)
  const [rejectionReasonInput, setRejectionReasonInput] = useState('')

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Filtragem de pedidos
  const filteredOrders = orders.filter((o) => {
    if (activeStatusFilter === 'all') return true
    return o.status === activeStatusFilter
  })

  // Contagens por status
  const countPending = orders.filter((o) => o.status === 'pending').length
  const countPreparing = orders.filter((o) => o.status === 'preparing').length
  const countReady = orders.filter((o) => o.status === 'ready').length
  const countDelivered = orders.filter((o) => o.status === 'delivered').length
  const countRejected = orders.filter((o) => o.status === 'rejected').length

  const handleConfirmReject = () => {
    if (rejectingOrderId) {
      rejectOrder(rejectingOrderId, rejectionReasonInput.trim())
      setRejectingOrderId(null)
      setRejectionReasonInput('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros por Status */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveStatusFilter('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeStatusFilter === 'all'
              ? 'bg-[#8b2cff] text-white shadow-sm'
              : 'bg-[#150f2e] border border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
          }`}
        >
          <span>Todos os Pedidos</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('pending')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeStatusFilter === 'pending'
              ? 'bg-amber-500 text-black font-extrabold shadow-sm'
              : 'bg-[#150f2e] border border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
          }`}
        >
          <span>Novos / Aguardando</span>
          {countPending > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
              {countPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStatusFilter('preparing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeStatusFilter === 'preparing'
              ? 'bg-[#ec4899] text-white shadow-sm'
              : 'bg-[#150f2e] border border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
          }`}
        >
          <span>Em Preparo</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
            {countPreparing}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('ready')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeStatusFilter === 'ready'
              ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
              : 'bg-[#150f2e] border border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
          }`}
        >
          <span>Prontos p/ Entrega/Balcão</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
            {countReady}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('delivered')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeStatusFilter === 'delivered'
              ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
              : 'bg-[#150f2e] border border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
          }`}
        >
          <span>Concluídos</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
            {countDelivered}
          </span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('rejected')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeStatusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-[#150f2e] border border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
          }`}
        >
          <span>Rejeitados</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
            {countRejected}
          </span>
        </button>
      </div>

      {/* Lista de Cards de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-[#130d26] border border-[#281c52] rounded-3xl text-slate-400 space-y-2">
          <Bell className="w-8 h-8 mx-auto text-slate-500" />
          <h4 className="text-base font-bold text-white">Nenhum pedido neste filtro</h4>
          <p className="text-xs">Os novos pedidos que entrarem no delivery aparecerão aqui em tempo real.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending'
            const isPreparing = order.status === 'preparing'
            const isReady = order.status === 'ready'
            const isDelivered = order.status === 'delivered'
            const isRejected = order.status === 'rejected'

            return (
              <div
                key={order.id}
                className={`p-5 rounded-3xl bg-[#130d26] border transition-all flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse-glow'
                    : isPreparing
                    ? 'border-[#ec4899]/60 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                    : isReady
                    ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : isDelivered
                    ? 'border-emerald-500/30 opacity-80'
                    : 'border-rose-500/30 opacity-70'
                }`}
              >
                <div>
                  {/* Topo do Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#231846]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">
                          #{order.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            order.deliveryType === 'delivery'
                              ? 'bg-[#8b2cff]/20 text-[#c4b5fd] border border-[#8b2cff]/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {order.deliveryType === 'delivery' ? 'Delivery' : 'Balcão'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl uppercase ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : isPreparing
                          ? 'bg-[#ec4899]/20 text-[#f472b6] border border-[#ec4899]/40'
                          : isReady
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : isDelivered
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isPending
                        ? 'Novo'
                        : isPreparing
                        ? 'Preparo'
                        : isReady
                        ? 'Pronto'
                        : isDelivered
                        ? 'Entregue'
                        : 'Rejeitado'}
                    </span>
                  </div>

                  {/* Dados do Cliente */}
                  <div className="py-3 border-b border-[#231846] space-y-1">
                    <div className="text-xs font-bold text-white">
                      {order.customer.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      WhatsApp: {order.customer.phone}
                    </div>
                    {order.deliveryType === 'delivery' && (
                      <div className="text-[11px] text-slate-300 leading-tight pt-1">
                        <Truck className="w-3 h-3 inline mr-1 text-[#8b2cff]" />
                        {order.customer.street}, {order.customer.number}{' '}
                        {order.customer.complement && `(${order.customer.complement})`} •{' '}
                        {order.customer.neighborhood}
                      </div>
                    )}
                  </div>

                  {/* Lista de Itens */}
                  <div className="py-3 space-y-2 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-[#181133] p-2 rounded-xl space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-[#f472b6]">
                            {formatBRL(item.totalPrice)}
                          </span>
                        </div>
                        {item.selectedSize && (
                          <div className="text-[10px] text-amber-300">
                            Tamanho: {item.selectedSize.name}
                          </div>
                        )}
                        {item.selectedComplements.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {item.selectedComplements.map((c) => c.item.name).join(', ')}
                          </div>
                        )}
                        {item.observations && (
                          <div className="text-[10px] text-amber-300/90 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                            Obs: {item.observations}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total & Pagamento */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Pgto: <b className="text-white uppercase">{order.paymentMethod}</b>
                      {order.changeFor && ` (Troco p/ ${formatBRL(order.changeFor)})`}
                    </span>
                    <span className="text-sm font-black text-white">
                      {formatBRL(order.total)}
                    </span>
                  </div>
                </div>

                {/* Ações Operacionais */}
                <div className="pt-4 mt-3 border-t border-[#231846] space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Botão de Impressão de Comanda */}
                    <button
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1d143c] hover:bg-[#281c52] border border-[#3b2b73] text-slate-200 text-xs font-semibold transition-colors"
                      title="Imprimir Comanda Térmica (80mm)"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#8b2cff]" />
                      <span>Imprimir</span>
                    </button>

                    {/* Ação: Rejeitar Pedido */}
                    {isPending && (
                      <button
                        onClick={() => setRejectingOrderId(order.id)}
                        className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                        title="Rejeitar Pedido"
                      >
                        Rejeitar
                      </button>
                    )}
                  </div>

                  {/* Ação Primária Conforme o Fluxo */}
                  {isPending && (
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black shadow-lg transition-all active:scale-98"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Aceitar Pedido</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-black shadow-lg transition-all active:scale-98"
                    >
                      <Truck className="w-4 h-4" />
                      <span>
                        {order.deliveryType === 'delivery'
                          ? 'Pronto p/ Entrega (Chamar Motoboy)'
                          : 'Pronto no Balcão'}
                      </span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-90 text-white text-xs font-black shadow-lg transition-all active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir Pedido (Entregue)</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Impressão */}
      {selectedOrderForPrint && (
        <ThermalReceiptModal
          order={selectedOrderForPrint}
          config={config}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}

      {/* Modal de Rejeição de Pedido */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#130d26] border border-[#281c52] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Rejeitar Pedido #{rejectingOrderId}</h3>
            <p className="text-xs text-slate-400">
              Pedidos rejeitados <b>não consomem</b> sua franquia mensal da NovaesWeb.
            </p>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Motivo (opcional):</label>
              <input
                type="text"
                placeholder="Ex: Fora do raio de entrega, fechamento..."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
