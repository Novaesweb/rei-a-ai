import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Category,
  Product,
  CartItem,
  Order,
  OrderStatus,
  StoreConfig,
  ComplementItem,
  CartSelectedComplement,
  CustomerInfo,
  PaymentMethod,
  DeliveryType,
} from '../types'
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_STORE_CONFIG,
} from '../data/initialData'
import {
  reportOrderAcceptedToMaster,
  recordOrderLifecycleEvent,
  OrderCancellationCategory,
} from '../lib/novaeswebUsage'
import { playOrderAlertSound } from '../lib/sound'
import {
  StoreAvailability,
  subscribeStoreAvailability,
} from '../services/storeAvailabilityService'
import { getStoredConnectIds } from '../services/connectService'
import { getOwnerMessages } from '../services/ownerMessageService'
import { supabase } from '../lib/supabaseClient'

interface StoreContextType {
  // Admin Auth
  isAdminAuthenticated: boolean
  adminUser: { email: string; name: string; role?: string } | null
  loginAdmin: (user: { email: string; name: string; role?: string }, remember?: boolean) => void
  logoutAdmin: () => void

  // Store Config & Status
  config: StoreConfig
  updateConfig: (newConfig: Partial<StoreConfig>) => void
  isStoreOpenNow: boolean
  storeAvailability: StoreAvailability

  // Messages & Connect
  unreadMessagesCount: number
  setUnreadMessagesCount: (count: number) => void
  
  // Catalog
  categories: Category[]
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => { success: boolean; error?: string }
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  toggleProductActive: (productId: string) => void

  // Cart
  cart: CartItem[]
  isCartDrawerOpen: boolean
  setIsCartDrawerOpen: (open: boolean) => void
  addToCart: (
    product: Product,
    size: { name: string; price: number } | undefined,
    complements: CartSelectedComplement[],
    observations: string,
    quantity: number
  ) => void
  removeFromCart: (cartItemId: string) => void
  updateCartQuantity: (cartItemId: string, delta: number) => void
  clearCart: () => void
  cartSubtotal: number
  cartItemCount: number

  // Modal Product Customization
  selectedProductForModal: Product | null
  setSelectedProductForModal: (product: Product | null) => void

  // Checkout & Orders
  isCheckoutModalOpen: boolean
  setIsCheckoutModalOpen: (open: boolean) => void
  orders: Order[]
  placeOrder: (data: {
    deliveryType: DeliveryType
    customer: CustomerInfo
    paymentMethod: PaymentMethod
    changeFor?: number
    notes?: string
  }) => Order
  acceptOrder: (orderId: string) => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  rejectOrder: (orderId: string, reason?: string) => Promise<void>
  cancelOrder: (
    orderId: string,
    reasonCategory: OrderCancellationCategory,
    reasonDetails?: string
  ) => Promise<void>
  hideOrder: (orderId: string) => Promise<void>
  trackedOrderId: string | null
  setTrackedOrderId: (id: string | null) => void

  // Audio Alerts
  soundAlertsEnabled: boolean
  setSoundAlertsEnabled: (enabled: boolean) => void
  playAlertSound: () => void

  // Navigation & Admin
  currentView: 'store' | 'admin'
  setCurrentView: (view: 'store' | 'admin') => void
  activeAdminTab: 'orders' | 'products' | 'settings' | 'plan' | 'messages' | 'connect' | 'addons'
  setActiveAdminTab: (tab: 'orders' | 'products' | 'settings' | 'plan' | 'messages' | 'connect' | 'addons') => void

  // Stats
  acceptedCountMonth: number
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const STORAGE_KEYS = {
  CONFIG: 'acai_do_rei_config_v1',
  PRODUCTS: 'acai_do_rei_products_v1',
  CATEGORIES: 'acai_do_rei_categories_v1',
  ORDERS: 'acai_do_rei_orders_v1',
  SOUND_ENABLED: 'acai_do_rei_sound_enabled',
  ADMIN_SESSION: 'acai_do_rei_admin_session_v1',
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Admin Auth State
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role?: string } | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION)
      return !!stored
    } catch {
      return false
    }
  })

  // Sincroniza sessão ativa do Supabase se houver
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setIsAdminAuthenticated(true)
        setAdminUser((prev) => {
          if (prev) return prev
          const userObj = {
            email: data.session.user.email || 'lojista@novaesweb.com',
            name: data.session.user.user_metadata?.full_name || 'Proprietário Açaí do Rei',
            role: 'owner',
          }
          try {
            localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(userObj))
          } catch {}
          return userObj
        })
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAdminAuthenticated(true)
        const userObj = {
          email: session.user.email || 'lojista@novaesweb.com',
          name: session.user.user_metadata?.full_name || 'Proprietário Açaí do Rei',
          role: 'owner',
        }
        setAdminUser(userObj)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const loginAdmin = (user: { email: string; name: string; role?: string }, remember: boolean = true) => {
    setAdminUser(user)
    setIsAdminAuthenticated(true)
    try {
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user))
      } else {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(user))
      }
    } catch (e) {
      console.error('Falha ao salvar sessão administrativa:', e)
    }
  }

  const logoutAdmin = () => {
    setAdminUser(null)
    setIsAdminAuthenticated(false)
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION)
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION)
      supabase.auth.signOut().catch(() => {})
    } catch (e) {
      console.error('Falha ao remover sessão administrativa:', e)
    }
    setCurrentView('store')
  }

  // Store Config
  const [config, setConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG)
      return saved ? JSON.parse(saved) : DEFAULT_STORE_CONFIG
    } catch {
      return DEFAULT_STORE_CONFIG
    }
  })

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
      if (saved) {
        const parsed: Category[] = JSON.parse(saved)
        return parsed.map((cat) => {
          const defaultCat = DEFAULT_CATEGORIES.find((d) => d.id === cat.id)
          return {
            ...cat,
            image: cat.image || defaultCat?.image,
          }
        })
      }
      return DEFAULT_CATEGORIES
    } catch {
      return DEFAULT_CATEGORIES
    }
  })

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS
    } catch {
      return DEFAULT_PRODUCTS
    }
  })

  // Orders (Inicializa limpo sem pedidos demonstrativos)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (saved) {
        const parsed: Order[] = JSON.parse(saved)
        // Filtra e descarta quaisquer pedidos antigos de demonstração
        const cleanOrders = parsed.filter(
          (o) =>
            o.id !== 'REI-1024' &&
            o.id !== 'REI-1023' &&
            !o.items.some((it) => it.cartItemId.startsWith('demo-item'))
        )
        return cleanOrders
      }
      return []
    } catch {
      return []
    }
  })

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null)
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null)

  // Audio Alerts
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED)
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  // Navigation
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store')
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'products' | 'settings' | 'plan' | 'messages' | 'connect' | 'addons'>('orders')

  // Master Availability & Messages
  const [storeAvailability, setStoreAvailability] = useState<StoreAvailability>({
    status: 'active',
    blockMode: null,
    message: null,
    returnAt: null,
  })
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0)

  // Subscrição de Disponibilidade Master
  useEffect(() => {
    const storeId = getStoredConnectIds().storeId || 'acai-do-rei-canoas'
    const unsub = subscribeStoreAvailability(storeId, (avail) => {
      setStoreAvailability(avail)
    })

    // Checa mensagens iniciais
    getOwnerMessages(storeId).then((msgs) => {
      const unread = msgs.filter((m) => !m.read_at).length
      setUnreadMessagesCount(unread)
    })

    return unsub
  }, [])

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  }, [config])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundAlertsEnabled))
  }, [soundAlertsEnabled])

  // Calculate store open/closed status
  const isStoreOpenNow = (() => {
    if (config.manualOpenOverride === 'open') return true
    if (config.manualOpenOverride === 'closed') return false

    // 'auto' mode based on schedule
    const now = new Date()
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const currentDayKey = days[now.getDay()]
    const daySchedule = config.schedule[currentDayKey]

    if (!daySchedule || !daySchedule.isOpen) return false

    const [openH, openM] = daySchedule.open.split(':').map(Number)
    const [closeH, closeM] = daySchedule.close.split(':').map(Number)

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  })()

  // Calculate accepted count for current month
  const currentMonthCompetence = new Date().toISOString().slice(0, 7) // "YYYY-MM"
  const acceptedCountMonth = orders.filter(
    (o) =>
      o.status !== 'rejected' &&
      o.acceptedAt &&
      o.acceptedAt.startsWith(currentMonthCompetence)
  ).length

  // Play audio sound helper
  const playAlertSound = () => {
    if (soundAlertsEnabled) {
      playOrderAlertSound()
    }
  }

  // Update Config
  const updateConfig = (newConfig: Partial<StoreConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }

  // Catalog methods
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    // Regra do Plano Business: Máximo 200 produtos
    if (products.length >= 200) {
      return {
        success: false,
        error: 'Limite de 200 produtos atingido para o plano Novaes Business.',
      }
    }

    const id = `prod-${Date.now()}`
    const fullProd: Product = { ...newProd, id }
    setProducts((prev) => [fullProd, ...prev])
    return { success: true }
  }

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const toggleProductActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
    )
  }

  // Cart methods
  const addToCart = (
    product: Product,
    size: { name: string; price: number } | undefined,
    complements: CartSelectedComplement[],
    observations: string,
    quantity: number
  ) => {
    const basePrice = size ? size.price : product.price
    const extrasPrice = complements.reduce((sum, c) => sum + (c.item.price || 0), 0)
    const unitPrice = basePrice + extrasPrice
    const totalPrice = unitPrice * quantity

    const cartItemId = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const newItem: CartItem = {
      cartItemId,
      product,
      selectedSize: size,
      selectedComplements: complements,
      observations: observations.trim() || undefined,
      unitPrice,
      quantity,
      totalPrice,
    }

    setCart((prev) => [...prev, newItem])
    setIsCartDrawerOpen(true)
  }

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Order creation & management
  const placeOrder = (data: {
    deliveryType: DeliveryType
    customer: CustomerInfo
    paymentMethod: PaymentMethod
    changeFor?: number
    notes?: string
  }): Order => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000)
    const orderId = `REI-${orderNumber}`
    const deliveryFee = data.deliveryType === 'delivery' ? config.deliveryFee : 0
    const total = cartSubtotal + deliveryFee

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'pending',
      deliveryType: data.deliveryType,
      customer: data.customer,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee,
      total,
      paymentMethod: data.paymentMethod,
      changeFor: data.changeFor,
      notes: data.notes,
    }

    setOrders((prev) => [newOrder, ...prev])
    clearCart()
    setIsCheckoutModalOpen(false)
    setTrackedOrderId(orderId)

    // Toca alerta para o painel se configurado
    playAlertSound()

    return newOrder
  }

  // Aceitar pedido: deduplicação técnica estável e chamada segura à RPC
  const acceptOrder = async (orderId: string) => {
    const target = orders.find((o) => o.id === orderId)
    if (!target) return

    const now = new Date().toISOString()
    const wasAlreadyRecorded = target.acceptedRecorded === true

    // Atualiza status local
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'preparing',
              acceptedAt: o.acceptedAt || now,
              acceptedRecorded: true,
            }
          : o
      )
    )

    // Apenas se ainda não foi reportado, invoca o Master
    if (!wasAlreadyRecorded) {
      await recordOrderLifecycleEvent({
        orderRef: target.id,
        eventType: 'accepted',
        statusFrom: target.status,
        statusTo: 'preparing',
        occurredAt: now,
      })
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const target = orders.find((o) => o.id === orderId)
    const prevStatus = target?.status || 'pending'

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )

    if (status === 'delivered') {
      await recordOrderLifecycleEvent({
        orderRef: orderId,
        eventType: 'delivered',
        statusFrom: prevStatus,
        statusTo: 'delivered',
      })
    }
  }

  const rejectOrder = async (orderId: string, reason?: string) => {
    const target = orders.find((o) => o.id === orderId)
    const prevStatus = target?.status || 'pending'

    // Pedidos rejeitados NÃO consom a franquia da NovaesWeb
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'rejected', rejectionReason: reason || 'Não foi possível atender no momento' }
          : o
      )
    )

    await recordOrderLifecycleEvent({
      orderRef: orderId,
      eventType: 'rejected',
      statusFrom: prevStatus,
      statusTo: 'rejected',
    })
  }

  const cancelOrder = async (
    orderId: string,
    reasonCategory: OrderCancellationCategory,
    reasonDetails?: string
  ) => {
    const target = orders.find((o) => o.id === orderId)
    const prevStatus = target?.status || 'preparing'

    // Pedido aceito e depois cancelado CONTINUA contabilizado na franquia
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled',
              rejectionReason: reasonDetails || 'Pedido cancelado após aceite.',
              cancellationCategory: reasonCategory,
            }
          : o
      )
    )

    await recordOrderLifecycleEvent({
      orderRef: orderId,
      eventType: 'cancelled',
      statusFrom: prevStatus,
      statusTo: 'cancelled',
      reasonCategory,
    })
  }

  const hideOrder = async (orderId: string) => {
    // Excluir ou ocultar no painel NÃO remove da contagem da franquia
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, hidden: true } : o))
    )

    await recordOrderLifecycleEvent({
      orderRef: orderId,
      eventType: 'hidden',
    })
  }

  return (
    <StoreContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        loginAdmin,
        logoutAdmin,
        config,
        updateConfig,
        isStoreOpenNow,
        storeAvailability,
        unreadMessagesCount,
        setUnreadMessagesCount,
        categories,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        cart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        selectedProductForModal,
        setSelectedProductForModal,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        orders,
        placeOrder,
        acceptOrder,
        updateOrderStatus,
        rejectOrder,
        cancelOrder,
        hideOrder,
        trackedOrderId,
        setTrackedOrderId,
        soundAlertsEnabled,
        setSoundAlertsEnabled,
        playAlertSound,
        currentView,
        setCurrentView,
        activeAdminTab,
        setActiveAdminTab,
        acceptedCountMonth,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
