import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Power, Sparkles, Layers } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { Product } from '../../types'

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
  } = useStore()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [isPopular, setIsPopular] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory
    return matchesSearch && matchesCat
  })

  const openNewModal = () => {
    setEditingProduct(null)
    setName('')
    setCategoryId(categories[0]?.id || '')
    setDescription('')
    setPrice('')
    setImage('/images/acai-strawberry-blueberry.jpg')
    setIsPopular(false)
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const openEditModal = (p: Product) => {
    setEditingProduct(p)
    setName(p.name)
    setCategoryId(p.categoryId)
    setDescription(p.description)
    setPrice(String(p.price))
    setImage(p.image)
    setIsPopular(!!p.isPopular)
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const numPrice = parseFloat(price.replace(',', '.'))
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Informe um preço válido maior que zero.')
      return
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: numPrice,
        image: image.trim(),
        isPopular,
      })
      setIsModalOpen(false)
    } else {
      const res = addProduct({
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: numPrice,
        image: image.trim(),
        isPopular,
        isActive: true,
      })

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao cadastrar produto.')
        return
      }

      setIsModalOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Topo com Contador e Botão Novo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#130d26] border border-[#281c52]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white font-['Outfit']">
              Gestão de Cardápio & Produtos
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8b2cff]/20 text-[#c4b5fd] font-bold border border-[#8b2cff]/40">
              {products.length} de 200 Produtos Ativos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plano Novaes Business permite o cadastro de até 200 produtos ativos simultaneamente.
          </p>
        </div>

        <button
          onClick={openNewModal}
          disabled={products.length >= 200}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs shadow-neon-primary transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#130d26] border border-[#281c52] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#8b2cff]"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#130d26] border border-[#281c52] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const categoryName = categories.find((c) => c.id === p.categoryId)?.name

          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl bg-[#130d26] border transition-all flex flex-col justify-between ${
                p.isActive ? 'border-[#281c52] hover:border-[#8b2cff]/50' : 'border-rose-950/40 opacity-50'
              }`}
            >
              <div>
                <div className="flex gap-3">
                  <img
                    src={p.image || '/images/acai-strawberry-blueberry.jpg'}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#2b1f58]"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/images/acai-strawberry-blueberry.jpg'
                    }}
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-[#ec4899] block uppercase">
                      {categoryName}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
                      {p.name}
                    </h3>
                    <div className="text-sm font-black text-white mt-1">
                      {formatBRL(p.price)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 mt-3 border-t border-[#231846] flex items-center justify-between">
                <button
                  onClick={() => toggleProductActive(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    p.isActive
                      ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                  }`}
                  title={p.isActive ? 'Pausar produto' : 'Ativar produto'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{p.isActive ? 'Ativo' : 'Pausado'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#201644] transition-colors"
                    title="Editar produto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o produto "${p.name}"?`)) {
                        deleteProduct(p.id)
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#130d26] border border-[#281c52] rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h3>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Copo Real 600ml"
                  className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Categoria *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 24,90"
                    className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Descrição Detalhada</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os ingredientes, cremosidade e complementos..."
                  className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff] resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Caminho / URL da Foto</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/images/copo-500.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-[#181133] border border-[#2b1f58] text-white text-xs focus:outline-none focus:border-[#8b2cff]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popCheck"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8b2cff] focus:ring-[#8b2cff] bg-[#0c081a] border-[#2b1f58]"
                />
                <label htmlFor="popCheck" className="text-xs text-white cursor-pointer">
                  Destacar como "Mais Pedido" na vitrine
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#231846]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
