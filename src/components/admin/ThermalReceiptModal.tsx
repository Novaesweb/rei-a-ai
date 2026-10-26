import React from 'react'
import { X, Printer, Check } from 'lucide-react'
import { Order, StoreConfig } from '../../types'

interface ThermalReceiptModalProps {
  order: Order
  config: StoreConfig
  onClose: () => void
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  config,
  onClose,
}) => {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const handlePrint = () => {
    window.print()
  }

  const printDate = new Date(order.createdAt).toLocaleString('pt-BR')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#130d26] border border-[#281c52] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-4 border-b border-[#231846] bg-[#160e2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#8b2cff]" />
            <span className="text-sm font-bold text-white">Comanda Térmica (80mm)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#201545] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prévia da Comanda (Estilo papel térmico) */}
        <div className="overflow-y-auto flex-1 p-4 bg-[#0a0614]">
          <div
            id="thermal-receipt"
            className="bg-white text-black p-5 rounded-xl font-mono text-xs shadow-lg space-y-3 mx-auto max-w-[320px]"
          >
            {/* Cabeçalho da Loja */}
            <div className="text-center pb-2 border-b-2 border-dashed border-gray-400">
              <h2 className="text-base font-black uppercase tracking-wider">
                👑 {config.name}
              </h2>
              <p className="text-[10px] text-gray-700">{config.tagline}</p>
              <p className="text-[10px] text-gray-700">{config.address}</p>
              <p className="text-[10px] font-bold text-gray-900">WhatsApp: {config.phone}</p>
            </div>

            {/* Dados do Pedido */}
            <div className="pb-2 border-b-2 border-dashed border-gray-400 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black">PEDIDO #{order.id}</span>
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">
                  {order.deliveryType === 'delivery' ? 'DELIVERY' : 'BALCÃO'}
                </span>
              </div>
              <p className="text-[10px] text-gray-700">Data/Hora: {printDate}</p>
              <p className="text-xs">
                <b>Cliente:</b> {order.customer.name}
              </p>
              <p className="text-xs">
                <b>Telefone:</b> {order.customer.phone}
              </p>

              {order.deliveryType === 'delivery' && (
                <div className="pt-1 text-[11px] leading-tight bg-gray-100 p-1.5 rounded">
                  <b>Endereço de Entrega:</b>
                  <br />
                  {order.customer.street}, {order.customer.number}
                  {order.customer.complement && ` - ${order.customer.complement}`}
                  <br />
                  Bairro: {order.customer.neighborhood} ({config.city})
                  {order.customer.referencePoint && (
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      Ref: {order.customer.referencePoint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista de Itens */}
            <div className="pb-2 border-b-2 border-dashed border-gray-400 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                ITENS DO PEDIDO
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>{formatBRL(item.totalPrice)}</span>
                  </div>

                  {item.selectedSize && (
                    <div className="text-[10px] text-gray-600 pl-2">
                      Tamanho: {item.selectedSize.name}
                    </div>
                  )}

                  {item.selectedComplements.length > 0 && (
                    <div className="text-[10px] text-gray-700 pl-2 space-y-0.5">
                      {item.selectedComplements.map((c, i) => (
                        <div key={i} className="flex justify-between">
                          <span>+ {c.item.name}</span>
                          {c.item.price > 0 && <span>{formatBRL(c.item.price)}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.observations && (
                    <div className="text-[10px] font-bold text-red-700 bg-red-50 p-1 rounded mt-0.5">
                      OBS: {item.observations}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totais & Pagamento */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span>Subtotal:</span>
                <span>{formatBRL(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Taxa Entrega:</span>
                <span>{formatBRL(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-400">
                <span>TOTAL:</span>
                <span>{formatBRL(order.total)}</span>
              </div>

              <div className="pt-2 text-[11px]">
                <b>Forma Pagamento:</b>{' '}
                <span className="uppercase font-bold">
                  {order.paymentMethod === 'pix'
                    ? 'PIX (MANUAL)'
                    : order.paymentMethod === 'card'
                    ? 'CARTÃO (MAQUININHA)'
                    : 'DINHEIRO'}
                </span>
                {order.changeFor && (
                  <div>
                    Troco para: <b>{formatBRL(order.changeFor)}</b> (Levar:{' '}
                    <b>{formatBRL(order.changeFor - order.total)}</b>)
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé da Comanda */}
            <div className="text-center pt-3 border-t-2 border-dashed border-gray-400 text-[9px] text-gray-500">
              NovaesWeb Delivery • {printDate}
            </div>
          </div>
        </div>

        {/* Botão de Impressão */}
        <div className="p-4 border-t border-[#231846] bg-[#160e2e] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#201545] transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-90 text-white font-bold text-xs shadow-neon-primary transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda</span>
          </button>
        </div>
      </div>
    </div>
  )
}
