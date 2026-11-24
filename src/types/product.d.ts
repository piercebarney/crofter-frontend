import type { Money } from 'src/types/common'
import type { Company_ProductCard } from 'src/types/company'



export interface ProducerProductCard {
	active: boolean
	company: { name: string }
	distributors: { id: string }[]
	forDelivery: boolean
	forDistribution: boolean
	forPickUp: boolean
	id: string
	image: string
	price: Money
	title: string
	unit: string
}

export interface Product {
	active: boolean
	availability?: string
	company?: {
		addresses: {
			city: string
			isDefault: boolean
			state: string
			}[]
		id: string
		image: string
		name: string
		role: CompanyRole
	}
	description?: string
	forDelivery: boolean
	forDistribution: boolean
	forPickUp: boolean
	id: string
	image: string
	isDeleted: boolean
	price: Money
	title: string
	unit: string
}

export interface ProductCard {
	active:				boolean
	availability:		string
	company:			Company_ProductCard
	forDelivery:		boolean
	forDistribution:	boolean
	forPickUp:			boolean
	id:					string
	image:				string
	price:				Money
	skuId:				string
	title:				string
	unit:				string
	variantId:			string
}

export interface ProductCardV1 {
	availability: string
	company: Company_ProductCard
	distributors: { id: string }[]
	forDelivery: boolean
	forDistribution: boolean
	forPickUp: boolean
	id: string
	image: string
	price: Money
	title: string
	unit: string
}

export interface ProductCartItem {
	company: {
		name: string
		image: string
		addresses: {
			city: string
			state: string
		}[]
	}
	forDelivery: boolean
	forDistribution: boolean
	forPickUp: boolean
	id: string
	image: string
	price: Money
	title: string
	unit: string
}