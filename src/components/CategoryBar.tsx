import React from 'react'
import { Sparkles, Heart, Flame, Layers, IceCream, CupSoda } from 'lucide-react'
import { Category } from '../types'

interface CategoryBarProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelectCategory: (id: string | null) => void
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'IceCream':
        return <IceCream className="w-4 h-4" />
      case 'Bowl':
        return <Sparkles className="w-4 h-4" />
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />
      case 'Heart':
        return <Heart className="w-4 h-4" />
      case 'Flame':
        return <Flame className="w-4 h-4" />
      case 'CupSoda':
        return <CupSoda className="w-4 h-4" />
      default:
        return <Layers className="w-4 h-4" />
    }
  }

  return (
    <div className="sticky top-20 z-30 bg-[#0a0714]/95 backdrop-blur-md border-b border-[#281c52] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Todas as Categorias */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === null
                ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                : 'bg-[#150f2e] text-slate-300 hover:bg-[#1f1742] border border-[#2b1f58]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Cardápio Completo</span>
          </button>

          {/* Categorias individuais */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                    : 'bg-[#150f2e] text-slate-300 hover:bg-[#1f1742] border border-[#2b1f58]'
                }`}
              >
                {getIcon(cat.icon)}
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
