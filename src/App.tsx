import React, { useState } from 'react'
import { useStore } from './context/StoreContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CategoryBar } from './components/CategoryBar'
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

      {/* Hero Promocional */}
      <Hero />

      {/* Acompanhamento de Pedido Ativo (se houver) */}
      {trackedOrderId && <OrderStatusTracker />}

      {/* Barra Rápida de Categorias */}
      <CategoryBar
        categories={categories}
        selectedCategoryId={selectedCategoryFilter}
        onSelectCategory={setSelectedCategoryFilter}
      />

      {/* Grade de Produtos */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {selectedCategoryFilter ? (
          // Exibe categoria selecionada
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#231846]">
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                {categories.find((c) => c.id === selectedCategoryFilter)?.name}
              </h2>
              <span className="text-xs text-slate-400">
                {displayedProducts.length} itens disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          // Exibe agrupado por todas as categorias
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryProducts = activeProducts.filter(
                (p) => p.categoryId === category.id
              )

              if (categoryProducts.length === 0) return null

              return (
                <section key={category.id} className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pb-2 border-b border-[#231846]">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {categoryProducts.length} opções
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

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
