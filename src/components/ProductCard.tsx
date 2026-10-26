import React from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Product } from '../types'
import { useStore } from '../context/StoreContext'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForModal } = useStore()

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div
      onClick={() => setSelectedProductForModal(product)}
      className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-[#130d26] border border-[#281c52] hover:border-[#8b2cff]/60 p-4 transition-all duration-300 hover:shadow-neon-primary hover:-translate-y-1 relative"
    >
      {/* Badge Popular */}
      {product.isPopular && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md">
          <Sparkles className="w-3 h-3" />
          Mais Pedido
        </div>
      )}

      <div>
        {/* Imagem */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-[#1e153b]">
          <img
            src={product.image || '/images/acai-strawberry-blueberry.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/images/acai-strawberry-blueberry.jpg'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#130d26]/80 via-transparent to-transparent opacity-60" />
        </div>

        {/* Título & Descrição */}
        <h3 className="text-base font-bold text-white group-hover:text-[#f472b6] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Preço e Botão */}
      <div className="mt-4 pt-3 border-t border-[#231846] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            A partir de
          </span>
          <span className="text-lg font-black text-white">
            {formatBRL(product.price)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedProductForModal(product)
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Montar</span>
        </button>
      </div>
    </div>
  )
}
