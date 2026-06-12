export interface ProductByHandleRequest {
  productByHandle: ProductByHandle
}

export interface ProductByHandle {
  id: string
  handle: string
  title: string
  productType: string
  description: string
  vendor: string
  priceRangeV2: PriceRangeV2
}

export interface PriceRangeV2 {
  minVariantPrice: MinVariantPrice
  maxVariantPrice: MaxVariantPrice
}

export interface MinVariantPrice {
  amount: string
  currencyCode: string
}

export interface MaxVariantPrice {
  amount: string
  currencyCode: string
}