import type { Fulfillment } from 'src/types/common'

export interface Preferences {
	pickUpLocationId: string|null
	fulfillment: Fulfillment|null
}

export interface Cart {
	checkout: boolean
	count: number
	deliveryChargeThreshold: {string:string, number:number}|null
	deliveryBaseFee: {string:string, number:number}|null
	deliveryDiscount: {string:string, number:number}|null
	deliveryTotal: {string:string, number:number}|null
	id: string
	items: CartItem[]
	preferences: Preferences
	promoCode: string|null
	subTotal: {string:string, number:number}|null
	subTotalWithDelivery: {string:string, number:number}|null
	discountSubTotal: {string:string, number:number}|null
	discountSubTotalWithDelivery: {string:string, number:number}|null
	priceDiscount: {string:string, number:number}|null
	tax: {string:string, number:number}|null
	total: {string:string, number:number}|null
	totalWithDelivery: {string:string, number:number}|null
	initialized: boolean
	synchronized: boolean
	syncError: Error|null
}

export interface CartItem {
	deliveryAddressId: string|null
	fulfillment: Fulfillment|null
	id: string|null
	pickUpLocationId: string|null
	quantity: number
	sku?: Sku|null
	skuId: string
}

export interface CartItemParams {
	deliveryAddressId?:string|null
	fulfillment?:Fulfillment|null
	id?:string|null
	pickUpLocationId?:string|null
	quantity?:number
}
