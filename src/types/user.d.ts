import type { Address } from 'src/types/address'
import type { Company_Partial } from 'src/types/company'
import type { PaymentToken } from 'src/types/payment'



export interface User {
	addresses: Address[]
	companies: Company_Partial[]
	defaultAddress: Address|null
	email: string
	emailVerified: boolean|null
	firstName: string
	id: string|null
	insertedAt: string
	lastName: string
	role: string
	paymentToken: PaymentToken|null
	phoneNumber: string
	zipCode: string
}

export interface User_Partial {
	email: string
	firstName: string
	lastName: string
	phoneNumber: string
}