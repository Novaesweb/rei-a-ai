import React from 'react'
import { Sparkles, ArrowRight, Layers } from 'lucide-react'
import { Category, Product } from '../types'

interface CategoryGridProps {
  categories: Category[]
  products: Product[]
  onSelectCategory: (categoryId: string) => void
}

// Gradientes sofisticados no estilo da referência, harmonizados com Açaí do Rei
const CARD_GRADIENTS = [
  'from-[#46145e] via-[#280a38] to-[#12041c] border-[#6b228f]/40 hover:border-[#ec4899]',
  'from-[#5c133a] via-[#380a22] to-[#1a030f] border-[#8a2258]/40 hover:border-[#f43f5e]',
  'from-[#301654] via-[#1c0c33] to-[#0c0417] border-[#4a2480]/40 hover:border-[#8b2cff]',
  'from-[#472210] via-[#2b1409] to-[#140803] border-[#6e371b]/40 hover:border-amber-500',
  'from-[#143047] via-[#0b1c2b] to-[#040c14] border-[#224e73]/40 hover:border-cyan-400',
  'from-[#4f1846] via-[#300d2a] to-[#170514] border-[#7a286d]/40 hover:border-fuchsia-400',
]

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  products,
  onSelectCategory,
}) => {
  const activeProducts = products.filter((p) => p.isActive)

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Topo da Seção no Estilo Oficial Burger House */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shadow-[0_0_10px_#ec4899] inline-block animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
            Categorias
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Toque para abrir
        </span>
      </div>

      {/* Grade em Quadrados (2 por linha no mobile, exatamente como na foto de referência) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {categories.map((category, index) => {
          const itemCount = activeProducts.filter((p) => p.categoryId === category.id).length
          const gradientClass = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`relative overflow-hidden rounded-3xl p-4 sm:p-6 bg-gradient-to-b ${gradientClass} border shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between items-center text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer min-h-[190px] sm:min-h-[230px]`}
            >
              {/* Efeito de brilho de fundo suave */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors" />

              {/* Imagem Centralizada em Quadrado Arredondado com Sombra (Estilo da Foto) */}
              <div className="my-auto pt-1">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.8)] border border-white/10 bg-black/40 group-hover:scale-105 transition-transform duration-300">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-300">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé do Card com Nome e Quantidade de Itens */}
              <div className="w-full mt-3 flex items-end justify-between gap-1.5 z-10">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-base font-bold text-white font-['Outfit'] tracking-tight leading-tight line-clamp-2 group-hover:text-amber-200 transition-colors">
                    {category.name}
                  </h3>
                  <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">
                    {itemCount} {itemCount === 1 ? 'opção' : 'opções'}
                  </span>
                </div>

                <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#ec4899] flex items-center justify-center text-white shrink-0 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
