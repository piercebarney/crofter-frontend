export interface Address {
	address1: string
	address2: string
	city: string
	country?: string
	isDefault?: boolean
	id?: string
	state: string
	zipCode: string
	deliveryInstructions?: string
}

export interface AddressValidationMatches {
	message: string
	potentialMatches: Address
	status: string
}

export interface Address_CityState {
	city: string
	isDefault?:	boolean
	state: string
}