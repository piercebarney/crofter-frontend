import type { Address, Address_CityState } from 'src/types/address'
import type { Product, ProductCardV1 } from 'src/types/product'
import type { OrderByOrder_Company, OrderByProduct_Company } from 'src/types/order'




export enum CompanyRole {
	DISTRIBUTOR	= 'DISTRIBUTOR',
	PRODUCER	= 'PRODUCER'
}

export interface MerchantApplication_Partial {
	business:	{
		address: Address
		businessName: string
		contactPhone: string
		description: string
		descriptorPhone: string
		directDebitDescriptor: string
		email: string
		legalName: string
		merchantCategoryCode: string
		ownershipStructureType: string
		paymentCardDescriptor: string
		registrationYear: string
		taxId: string
		timeZoneCode: string
		website: string
	}
	deposit: {
		accountNumber: string
		accountType: string
		bankName: string
		holderName: string
		routingNumber: string
	}
	estimates: {
		annualCardsVolume: number
		annualDirectDebitVolume: number
		avgCardsTransactionAmount: number
		avgDirectDebitTransactionAmount: number
		maxTransactionAmount: number
	}
	officer: {
		address: Address
		birthDate: string
		email: string
		firstName: string
		lastName: string
		phone: string
		socialSecurity: string
		title: string
	}
	owners: {
		address: Address
		birthDate: string
		email: string
		firstName: string
		lastName: string
		phone: string
		socialSecurity: string
		stakePercentage: number
	}[]
}

export interface MerchantApplicationDetails {
	application: MerchantApplication_Partial
	applicationId: string
	status: string
}
export interface Company {
	addresses: Address[]
	bio: string
	defaultCompany: Address|null
	email: string
	emailVerfified: boolean|null
	id: string|null
	image: string|null
	merchantApplicationDetails?: MerchantApplicationDetails|null
	name: string|null
	operatingHours: string|null
	phoneNumber: string
	orders: {
		open: any|null,
		closed: any|null
	}
	ordersByOrder?: {
		open: OrderByOrder_Company[]|null
		closed: {
			all: OrderByOrder_Company[]|null,
			recent: OrderByOrder_Company[]|null,
			total: number
		}
	}|null
	ordersByOrderSearch?: {
		open: OrderByOrder_Company[]|null
		closed: {
			all: OrderByOrder_Company[]|null,
			recent: OrderByOrder_Company[]|null,
			total: number
		}
	}|null
	ordersByProduct?: OrderByProduct_Company[]|null
	ordersByProductSearch?: OrderByProduct_Company[]|null
	products: Product[]|null
	role: CompanyRole
	variants: Variant[]|null
	skus: Sku[]|null
	stockItems: StockItem[]|null
	storageLocations: StorageLocation[]|null
	ziftAccountId: string|null
}

export interface Company_Page {
	addresses: Address[]
	bio: string
	email: string
	id: string|null
	image: string|null
	name: string|null
	operatingHours: string|null
	phoneNumber: string|null
	products: ProductCardV1[]
	role: CompanyRole
}

export interface Company_Partial {
	id: string
	image?: string
	name: string
	role: CompanyRole
	ziftAccountId?: string|null
}

export interface Company_Product {
	addresses: Address_CityState[]
	id: string
	image: string
	name: string
	role: CompanyRole
}

export interface Company_ProductCard {
	id: string
	image: string
	name: string
	role: CompanyRole
}