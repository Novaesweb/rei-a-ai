export interface ComplementItem {
  id: string
  name: string
  price: number // 0 for free toppings
}

export interface ComplementGroup {
  id: string
  title: string
  required: boolean
  maxChoices: number
  items: ComplementItem[]
}

export interface Product {
  id: string
  name: string
  categoryId: string
  description: string
  price: number
  image: string
  isPopular?: boolean
  isActive: boolean
  sizes?: { name: string; price: number }[]
  complementGroups?: ComplementGroup[]
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
}

export interface CartSelectedComplement {
  groupId: string
  groupTitle: string
  item: ComplementItem
}

export interface CartItem {
  cartItemId: string
  product: Product
  selectedSize?: { name: string; price: number }
  selectedComplements: CartSelectedComplement[]
  observations?: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'rejected'
export type DeliveryType = 'delivery' | 'pickup'
export type PaymentMethod = 'pix' | 'money' | 'card'

export interface CustomerInfo {
  name: string
  phone: string
  neighborhood?: string
  street?: string
  number?: string
  complement?: string
  referencePoint?: string
}

export interface Order {
  id: string // e.g. REI-1042
  createdAt: string
  acceptedAt?: string
  acceptedRecorded?: boolean // deduplication flag
  status: OrderStatus
  rejectionReason?: string
  deliveryType: DeliveryType
  customer: CustomerInfo
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  changeFor?: number
  notes?: string
}

export interface StoreScheduleDay {
  open: string // "18:00"
  close: string // "23:30"
  isOpen: boolean
}

export interface StoreConfig {
  name: string
  brandName: string
  tagline: string
  city: string
  state: string
  address: string
  phone: string
  whatsapp: string
  pixKey: string
  pixBeneficiary: string
  deliveryFee: number
  minOrderValue: number
  manualOpenOverride: 'auto' | 'open' | 'closed'
  schedule: Record<string, StoreScheduleDay> // mon, tue, wed, thu, fri, sat, sun
  adminUsers: { id: string; email: string; name: string }[]
}
