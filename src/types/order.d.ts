import type { Fulfillment, Money } from 'src/types/common'
import type { Address } from 'src/types/address'
import type { Product, ProductCartItem } from 'src/types/product'
import type { Company } from 'src/types/company'



export interface OrderItem_ProductCartItem {
	product: ProductCartItem
}

export interface Order_ProductCartItem {
	orderItems: OrderItem_ProductCartItem[]
}

export interface OrderItem_Partial {
	status: string
}

export interface OrderItem_Open {
	distributorLocation: { id: string }
	fulfillment: Fulfillment
	id: string
	priceWhenOrdered: Money
	product: {
		company: { name: string }
		id: string
		image: string
		price: Money
		title: string
		unit: string
	}
	quantity: number
	status: string
}

export interface Order_Open {
	createdDate: string
	deliveryItems?: OrderItem_Open[]
	distributorItems?: Record<string, OrderItem_Open[]>
	id: string
	pickupItems?: OrderItem_Open[]
	orderItems: OrderItem_Open[]
	salesTax: Money
	total: Money
}

export interface Order_Closed {
	createdDate: string
	id: string
	orderItems: OrderItem_Partial[]
	total: Money
}

export interface OrderItem {
	fulfillment: Fulfillment
	id: string
	priceWhenOrdered: Money
	product: Product
	quantity: number
	status: string
}

export interface Order {
	company: Company
	createdDate: string
	deliveryAdress: Address
	id: string
	orderItems: OrderItem[]
	user: { id: string }
	salesTax: { asString: string }
	subTotal: { asString: string }
	total: { asString: string }
}

export interface OrderItem_Company {
	distributorLocation: { 
		city: string
		id: string
	}
	fulfillment: Fulfillment
	id: string
	product: {
		id: string
		image: string
		title: string
		unit: string
	}
	quantity: number
	show?: boolean
	status: string
}

export interface OrderByOrder_Company_Raw {
	createdDate: string
	id: string
	orderItems: OrderItem_Company[]
	updatedDate: string
	user: {
		firstName: string
		lastName: string
		phoneNumber: string
	}
}

export interface OrderByOrder_Company {
	createdDate: string
	fulfilledCount: number
	id: string
	newCount: number
	orderItems: OrderItem_Company[]
	readyCount: number
	show: boolean
	updatedDate: string
	user: {
		firstName: string
		lastName: string
		phoneNumber: string
	}
}

export interface OrderByProduct_Company_Raw {
	id: string
	image: string
	orders: {
		createdDate: string
		id: string
		orderItems: {
			distributorLocation: { 
				city: string
				id: string
			}
			fulfillment: Fulfillment
			id: string
			quantity: number
			status: string
		}[]
		user: {
			firstName: string
			lastName: string
		}
	}[]
	title: string
	unit: string
}

export interface OrderByProduct_Order_Company {
	createdDate: string
	distributorLocation: {
		city: string
		id: string
	}
	fulfillment: Fulfillment
	orderId: string
	orderItemId: string
	quantity: number
	status: string
	unit: string
	user: {
		firstName: string
		lastName: string
	}
}
export interface OrderByProduct_Company {
	id: string
	image: string
	newCount: number
	newQuantity: number
	orders: OrderByProduct_Order_Company[]
	quantity: number
	readyCount: number
	title: string
	unit: string
}