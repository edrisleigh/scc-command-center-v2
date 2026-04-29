export interface Product {
  clientId: string
  id: string
  shortSku: string
  productId: string
  sellerSku: string
  category: string
  productName: string
  skuId: string
  variation: string
  retailPrice: number
}

export interface SampleOrder {
  clientId: string
  id: string
  orderId: string
  status: 'pending' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  creatorUsername: string
  productName: string
  productSku: string
  variation: string
  quantity: number
  createdTime: string
  shippedTime: string | null
  deliveredTime: string | null
  trackingId: string
  shippingProvider: string
}

export interface HeroProduct {
  clientId: string
  id: string
  productName: string
  shortSku: string
  category: string
  isHero: boolean
  p28dGmv: number
  p28dOrders: number
  p28dViews: number
}

export interface Restock {
  clientId: string
  id: string
  productName: string
  shortSku: string
  hasRestock: boolean
  eta: string | null
  notes: string
}
