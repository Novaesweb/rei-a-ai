import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useStore } from './context/StoreContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryGrid } from './components/CategoryGrid'
import { ProductCard } from './components/ProductCard'
import { ProductModal } from './components/ProductModal'
import { CartDrawer } from './components/CartDrawer'
import { CheckoutModal } from './components/CheckoutModal'
import { OrderStatusTracker } from './components/OrderStatusTracker'
import { Footer } from './components/Footer'

import { AdminHeader } from './components/admin/AdminHeader'
import { AdminOrders } from './components/admin/AdminOrders'
import { AdminProducts } from './components/admin/AdminProducts'
import { AdminSettings } from './components/admin/AdminSettings'
import { AdminPlan } from './components/admin/AdminPlan'
import { AdminOwnerMessages } from './components/admin/AdminOwnerMessages'
import { AdminAddons } from './components/admin/AdminAddons'
import { ConnectGate } from './components/admin/ConnectGate'
import { AdminLogin } from './components/admin/AdminLogin'
import { SiteSuspendedScreen } from './components/SiteSuspendedScreen'

export const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeAdminTab,
    isAdminAuthenticated,
    categories,
    products,
    selectedProductForModal,
    setSelectedProductForModal,
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    trackedOrderId,
    storeAvailability,
    setUnreadMessagesCount,
  } = useStore()

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)

  // Active public products
  const activeProducts = products.filter((p) => p.isActive)

  const displayedProducts = selectedCategoryFilter
    ? activeProducts.filter((p) => p.categoryId === selectedCategoryFilter)
    : activeProducts

  if (currentView === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onBackToStore={() => setCurrentView('store')} />
    }

    return (
      <div className="min-h-screen bg-[#0a0714] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <AdminHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeAdminTab === 'orders' && <AdminOrders />}
          {activeAdminTab === 'products' && <AdminProducts />}
          {activeAdminTab === 'settings' && <AdminSettings />}
          {activeAdminTab === 'plan' && <AdminPlan />}
          {activeAdminTab === 'messages' && (
            <AdminOwnerMessages onUnreadChange={setUnreadMessagesCount} />
          )}
          {activeAdminTab === 'addons' && <AdminAddons />}
          {activeAdminTab === 'connect' && <ConnectGate />}
        </main>

        {/* Rodapé Administrativo com Indicador de Versão (v5.2) */}
        <footer className="border-t border-[#1b1236] py-4 px-4 text-xs text-slate-400 mt-auto bg-[#0a0714]/80">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div
              className="novaesweb-version-badge flex items-center gap-2 px-3 py-1 rounded-full bg-[#140e2b] border border-[#2a1d56] text-[11px] text-slate-300 font-medium"
              title="NovaesWeb Commerce Engine — Versão 5.2"
            >
              <span className="status-dot-green inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>v5.2 • Sistema Atualizado</span>
            </div>

            <div className="novaesweb-footer-signature flex items-center gap-1.5 text-slate-400 text-xs">
              <span>NovaesWeb Commerce Engine • </span>
              <a
                href="https://novaesweb.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="novaesweb-brand-link text-[#c4b5fd] hover:text-[#ec4899] font-bold transition-colors"
              >
                NovaesWeb
              </a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Se a loja estiver sob manutenção ou suspensão administrativa do Master
  const isSuspendedOrMaintenance =
    storeAvailability.status === 'maintenance' ||
    storeAvailability.status === 'suspended' ||
    storeAvailability.status === 'archived'

  if (isSuspendedOrMaintenance) {
    return (
      <SiteSuspendedScreen
        availability={storeAvailability}
        onAccessAdmin={() => setCurrentView('admin')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0714] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Público */}
      <Header />

      {/* Acompanhamento de Pedido Ativo (se houver) */}
      {trackedOrderId && <OrderStatusTracker />}

      {selectedCategoryFilter === null ? (
        <>
          {/* Hero Promocional (Apenas na tela inicial de categorias) */}
          <Hero />

          {/* Grade Oficial de Categorias em Quadrados (Estilo Burger House Reference) */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <CategoryGrid
              categories={categories}
              products={products}
              onSelectCategory={(catId) => {
                setSelectedCategoryFilter(catId)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </main>
        </>
      ) : (
        <>
          {/* Barra Superior Focada com Botão Voltar às Categorias */}
          <div className="sticky top-20 z-30 bg-[#0a0714]/95 backdrop-blur-md border-b border-[#281c52] py-3.5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b1238] hover:bg-[#281b52] border border-[#3b2b73] text-white text-xs sm:text-sm font-bold transition-all shadow-md group shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#ec4899] group-hover:-translate-x-1 transition-transform" />
                <span>← Voltar para Categorias</span>
              </button>

              {/* Atalho Rápido para Alternar entre Categorias */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                {categories.map((cat) => {
                  const isCurrent = cat.id === selectedCategoryFilter
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryFilter(cat.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#8b2cff] to-[#ec4899] text-white shadow-neon-primary'
                          : 'bg-[#150f2e] text-slate-400 hover:text-white border border-[#2b1f58]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Conteúdo Focado da Categoria Selecionada */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fade-in">
            {(() => {
              const currentCat = categories.find((c) => c.id === selectedCategoryFilter)
              return (
                <div className="space-y-6">
                  {/* Banner / Cabeçalho da Categoria com Imagem */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1c0d38] via-[#2a0e3b] to-[#160829] border border-[#3e1f6e] flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
                    {currentCat?.image && (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                        <img
                          src={currentCat.image}
                          alt={currentCat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="text-center sm:text-left space-y-1.5 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                          {currentCat?.name}
                        </h1>
                        <span className="text-xs text-[#f472b6] font-bold px-3 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 inline-block">
                          {displayedProducts.length} itens disponíveis
                        </span>
                      </div>
                      {currentCat?.description && (
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                          {currentCat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Grade de Produtos da Categoria */}
                  {displayedProducts.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-[#120c24] border border-[#281c52] space-y-3">
                      <p className="text-slate-400 text-sm">
                        Nenhum produto disponível nesta categoria no momento.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter(null)}
                        className="px-4 py-2 rounded-xl bg-[#8b2cff] text-white text-xs font-bold"
                      >
                        Voltar para Categorias
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {displayedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </main>
        </>
      )}

      {/* Modal de Customização do Produto */}
      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}

      {/* Gaveta do Carrinho */}
      <CartDrawer />

      {/* Modal de Checkout */}
      {isCheckoutModalOpen && (
        <CheckoutModal onClose={() => setIsCheckoutModalOpen(false)} />
      )}

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  )
}
