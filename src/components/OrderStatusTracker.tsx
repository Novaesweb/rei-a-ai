import React from 'react'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageCircle,
  XCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { OrderStatus } from '../types'

export const OrderStatusTracker: React.FC = () => {
  const { orders, trackedOrderId, setTrackedOrderId, config } = useStore()

  if (!trackedOrderId) return null

  const order = orders.find((o) => o.id === trackedOrderId)
  if (!order) return null

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Status mapping
  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: 'pending',
      label: 'Pedido Recebido',
      desc: 'Aguardando confirmação da equipe',
    },
    {
      key: 'preparing',
      label: 'Em Preparo',
      desc: 'Montando com ingredientes selecionados',
    },
    {
      key: 'ready',
      label: order.deliveryType === 'delivery' ? 'Saiu para Entrega' : 'Pronto para Retirada',
      desc: order.deliveryType === 'delivery' ? 'Entregador a caminho' : 'Disponível no balcão',
    },
    {
      key: 'delivered',
      label: 'Concluído',
      desc: 'Pedido entregue com sucesso',
    },
  ]

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0
      case 'preparing':
        return 1
      case 'ready':
        return 2
      case 'delivered':
        return 3
      default:
        return -1
    }
  }

  const currentStepIdx = getStepIndex(order.status)

  // Mensagem para o WhatsApp
  const generateWhatsAppMessage = () => {
    let msg = `*👑 PEDIDO AÇAÍ DO REI #${order.id}*\n`
    msg += `Olá, equipe! Acabei de fazer o pedido pelo site:\n\n`
    msg += `*Cliente:* ${order.customer.name}\n`
    msg += `*Telefone:* ${order.customer.phone}\n`
    msg += `*Tipo:* ${order.deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada no Balcão'}\n`

    if (order.deliveryType === 'delivery') {
      msg += `*Endereço:* ${order.customer.street}, ${order.customer.number} - ${order.customer.neighborhood}\n`
      if (order.customer.complement) msg += `*Complemento:* ${order.customer.complement}\n`
    }

    msg += `\n*ITENS DO PEDIDO:*\n`
    order.items.forEach((item, i) => {
      msg += `${i + 1}. *${item.product.name}* (x${item.quantity}) - ${formatBRL(item.totalPrice)}\n`
      if (item.selectedSize) msg += `   Tamanho: ${item.selectedSize.name}\n`
      if (item.selectedComplements.length > 0) {
        msg += `   Complementos: ${item.selectedComplements.map((c) => c.item.name).join(', ')}\n`
      }
      if (item.observations) msg += `   Obs: ${item.observations}\n`
    })

    msg += `\n*Forma de Pagamento:* ${
      order.paymentMethod === 'pix'
        ? 'Pix'
        : order.paymentMethod === 'card'
        ? 'Cartão'
        : 'Dinheiro'
    }\n`
    if (order.changeFor) msg += `*Troco para:* ${formatBRL(order.changeFor)}\n`
    msg += `*Total:* ${formatBRL(order.total)}\n\n`
    if (order.paymentMethod === 'pix') {
      msg += `Estou enviando o comprovante do Pix em anexo. Aguardo a confirmação! 💜`
    } else {
      msg += `Aguardando a confirmação do pedido! 💜`
    }

    return encodeURIComponent(msg)
  }

  const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${generateWhatsAppMessage()}`

  return (
    <div
      id="order-tracker-section"
      className="max-w-4xl mx-auto px-4 py-8 sm:px-6"
    >
      <div className="relative rounded-3xl bg-[#140d2b] border border-[#3b2b73] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ec4899]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#281c52]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#f472b6] tracking-wider uppercase">
                Acompanhamento em Tempo Real
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
              Pedido #{order.id}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar no WhatsApp</span>
            </a>

            <button
              onClick={() => setTrackedOrderId(null)}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-[#2b1f58] hover:bg-[#201644] transition-colors"
            >
              Fechar Acompanhamento
            </button>
          </div>
        </div>

        {/* Status Rejeitado */}
        {order.status === 'rejected' ? (
          <div className="my-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <b className="text-white block font-bold">Pedido Não Aceito no Momento:</b>
              <span>{order.rejectionReason || 'O estabelecimento não pôde atender seu pedido no momento.'}</span>
            </div>
          </div>
        ) : (
          /* Timeline de Progresso */
          <div className="my-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx
                const isCurrent = currentStepIdx === idx

                return (
                  <div
                    key={step.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-b from-[#8b2cff]/20 to-[#ec4899]/20 border-[#ec4899] shadow-neon-primary'
                        : isPassed
                        ? 'bg-[#181133] border-emerald-500/40 text-slate-300'
                        : 'bg-[#100b24] border-[#221844] text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed
                            ? 'bg-emerald-500 text-black'
                            : isCurrent
                            ? 'bg-[#ec4899] text-white animate-pulse'
                            : 'bg-[#201644] text-slate-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="text-xs font-bold text-white leading-tight">
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Resumo do Pedido */}
        <div className="p-5 rounded-2xl bg-[#0f0a21] border border-[#231846] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resumo dos Itens Selecionados
          </h3>

          <div className="space-y-2 text-xs">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between py-1.5 border-b border-[#1f153a] last:border-0"
              >
                <div>
                  <span className="font-bold text-white">
                    {item.quantity}x {item.product.name}
                  </span>
                  {item.selectedComplements.length > 0 && (
                    <p className="text-[11px] text-slate-400">
                      {item.selectedComplements.map((c) => c.item.name).join(', ')}
                    </p>
                  )}
                  {item.observations && (
                    <p className="text-[11px] text-amber-300/80 italic">
                      Obs: {item.observations}
                    </p>
                  )}
                </div>
                <span className="font-bold text-[#f472b6]">
                  {formatBRL(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#231846] flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Total ({order.paymentMethod.toUpperCase()})
            </span>
            <span className="text-base font-black text-white">
              {formatBRL(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
