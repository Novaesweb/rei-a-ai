import React, { useState, useEffect } from 'react'
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react'
import { Product, CartSelectedComplement, ComplementItem } from '../types'
import { useStore } from '../context/StoreContext'

interface ProductModalProps {
  product: Product
  onClose: () => void
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useStore()

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<{ name: string; price: number } | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  )
  const [selectedComplements, setSelectedComplements] = useState<CartSelectedComplement[]>([])
  const [observations, setObservations] = useState('')

  // Reset when product changes
  useEffect(() => {
    setQuantity(1)
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined)
    setSelectedComplements([])
    setObservations('')
  }, [product])

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  // Toggle complement
  const toggleComplement = (groupId: string, groupTitle: string, item: ComplementItem, maxChoices: number) => {
    const isAlreadySelected = selectedComplements.some(
      (c) => c.groupId === groupId && c.item.id === item.id
    )

    if (isAlreadySelected) {
      setSelectedComplements((prev) =>
        prev.filter((c) => !(c.groupId === groupId && c.item.id === item.id))
      )
    } else {
      // Check max choices limit for this group
      const currentInGroup = selectedComplements.filter((c) => c.groupId === groupId).length
      if (maxChoices > 0 && currentInGroup >= maxChoices) {
        return // reached limit
      }
      setSelectedComplements((prev) => [
        ...prev,
        { groupId, groupTitle, item },
      ])
    }
  }

  // Preço unitário dinâmico
  const basePrice = selectedSize ? selectedSize.price : product.price
  const extrasPrice = selectedComplements.reduce((sum, c) => sum + (c.item.price || 0), 0)
  const unitPrice = basePrice + extrasPrice
  const totalPrice = unitPrice * quantity

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedComplements, observations, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#130d26] border border-[#281c52] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#0a0714]/80 text-slate-300 hover:text-white border border-[#281c52] hover:bg-[#8b2cff] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Header do Produto */}
          <div>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-[#1e153b]">
              <img
                src={product.image || '/images/acai-strawberry-blueberry.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/images/acai-strawberry-blueberry.jpg'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#130d26] via-transparent to-transparent" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              {product.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Tamanhos (se houver) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Escolha o Tamanho
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize?.name === size.name
                  return (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#8b2cff]/20 border-[#8b2cff] text-white shadow-neon-primary'
                          : 'bg-[#181133] border-[#2b1f58] text-slate-300 hover:bg-[#201644]'
                      }`}
                    >
                      <div className="text-xs font-bold">{size.name}</div>
                      <div className="text-xs text-[#f472b6] font-semibold mt-0.5">
                        {formatBRL(size.price)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grupos de Complementos */}
          {product.complementGroups?.map((group) => {
            const currentSelectedInGroup = selectedComplements.filter(
              (c) => c.groupId === group.id
            )
            const count = currentSelectedInGroup.length
            const isFull = group.maxChoices > 0 && count >= group.maxChoices

            return (
              <div
                key={group.id}
                className="p-4 rounded-2xl bg-[#181133] border border-[#2b1f58] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{group.title}</span>
                      {group.items.length > 0 && group.items.every((it) => it.price === 0) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          GRÁTIS
                        </span>
                      )}
                    </h4>
                    {group.maxChoices > 0 && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Selecione até {group.maxChoices} ({count}/{group.maxChoices})
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {group.items.map((item) => {
                    const isSelected = selectedComplements.some(
                      (c) => c.groupId === group.id && c.item.id === item.id
                    )
                    const disabled = !isSelected && isFull

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleComplement(group.id, group.title, item, group.maxChoices)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#8b2cff]/30 to-[#ec4899]/30 border-[#ec4899] text-white shadow-sm'
                            : disabled
                            ? 'opacity-40 bg-[#120d26] border-[#221844] text-slate-500 cursor-not-allowed'
                            : 'bg-[#130d26] border-[#251a4a] text-slate-300 hover:bg-[#1c133a]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-[#ec4899] border-[#ec4899] text-white'
                                : 'border-[#3d2b78] bg-[#0d091a]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-bold text-[#f472b6]">
                          {item.price > 0 ? `+ ${formatBRL(item.price)}` : 'Incluso'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Campo de Observações */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Alguma Observação Especial?
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ex: sem banana, granola separada, leite ninho no topo..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181133] border border-[#2b1f58] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#8b2cff] focus:ring-1 focus:ring-[#8b2cff] transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer com Quantidade e Botão Adicionar */}
        <div className="p-4 sm:p-6 bg-[#0e091f] border-t border-[#281c52] flex items-center gap-4">
          {/* Seletor de Quantidade */}
          <div className="flex items-center rounded-xl bg-[#181133] border border-[#2b1f58] p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Botão de Adicionar */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-95 text-white font-extrabold text-sm shadow-neon-primary transition-all active:scale-[0.98]"
          >
            <span>Adicionar ao Pedido</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-lg text-xs font-black">
              {formatBRL(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
