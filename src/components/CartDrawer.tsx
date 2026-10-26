import React, { useState } from 'react'
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Store,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { DeliveryType } from '../types'

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartItemCount,
    config,
    setIsCheckoutModalOpen,
  } = useStore()

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')

  if (!isCartDrawerOpen) return null

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const deliveryFee = deliveryType === 'delivery' ? config.deliveryFee : 0
  const finalTotal = cartSubtotal + deliveryFee

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false)
    setIsCheckoutModalOpen(true)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#110b24] border-l border-[#281c52] shadow-2xl flex flex-col">
          {/* Header do Carrinho */}
          <div className="p-5 border-b border-[#231846] flex items-center justify-between bg-[#150e2e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b2cff] to-[#ec4899] flex items-center justify-center text-white shadow-neon-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-['Outfit']">
                  Meu Carrinho
                </h3>
                <p className="text-xs text-slate-400">
                  {cartItemCount} {cartItemCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#201545] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tipo de Entrega Toggle */}
          {cart.length > 0 && (
            <div className="p-4 bg-[#140d29] border-b border-[#231846]">
              <div className="grid grid-cols-2 gap-2 bg-[#0c081a] p-1 rounded-2xl border border-[#231846]">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    deliveryType === 'delivery'
                      ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Entrega ({formatBRL(config.deliveryFee)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    deliveryType === 'pickup'
                      ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Retirada (Grátis)</span>
                </button>
              </div>
            </div>
          )}

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#1b1236] border border-[#2b1f58] flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Seu carrinho está vazio</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Que tal escolher um delicioso açaí cremoso para refrescar seu dia?
                  </p>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-2 px-4 py-2 text-xs font-bold text-[#f472b6] bg-[#ec4899]/10 border border-[#ec4899]/30 rounded-xl hover:bg-[#ec4899]/20 transition-all"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 rounded-2xl bg-[#160f30] border border-[#2b1f58] space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.product.image || '/images/acai-strawberry-blueberry.jpg'}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#3b2b73]"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            '/images/acai-strawberry-blueberry.jpg'
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {item.product.name}
                        </h4>
                        {item.selectedSize && (
                          <span className="text-[11px] text-amber-300 font-semibold block mt-0.5">
                            Tamanho: {item.selectedSize.name}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-[#f472b6] block mt-0.5">
                          {formatBRL(item.totalPrice)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Complementos Selecionados */}
                  {item.selectedComplements.length > 0 && (
                    <div className="pl-2 border-l-2 border-[#8b2cff]/40 text-[11px] text-slate-300 space-y-0.5">
                      {item.selectedComplements.map((comp, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300">
                          <span>• {comp.item.name}</span>
                          {comp.item.price > 0 && (
                            <span className="text-[#f472b6] font-bold">
                              +{formatBRL(comp.item.price)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Observações */}
                  {item.observations && (
                    <div className="text-[11px] text-amber-300/90 italic bg-amber-500/10 px-2 py-1 rounded-lg">
                      Obs: {item.observations}
                    </div>
                  )}

                  {/* Controle de Quantidade */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#231846]">
                    <span className="text-[11px] text-slate-400">Quantidade</span>
                    <div className="flex items-center gap-2 bg-[#0f0921] px-2 py-0.5 rounded-lg border border-[#2b1f58]">
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, -1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white min-w-[14px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, 1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com Subtotais e Finalizar */}
          {cart.length > 0 && (
            <div className="p-5 bg-[#150e2e] border-t border-[#231846] space-y-3">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatBRL(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega ({deliveryType === 'delivery' ? 'Canoas' : 'Balcão'})</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'font-semibold text-white'}>
                    {deliveryFee === 0 ? 'Grátis' : formatBRL(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#281c52] text-sm font-black text-white">
                  <span>Total</span>
                  <span className="text-lg bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
                    {formatBRL(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-95 text-white font-black text-sm shadow-neon-primary transition-all active:scale-[0.98]"
              >
                <span>Avançar para o Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
