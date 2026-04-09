export interface Product {
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
  id: string
  productName: string
  shortSku: string
  hasRestock: boolean
  eta: string | null
  notes: string
}
