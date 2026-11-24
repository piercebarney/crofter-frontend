export type Statuses = {
	queryParamsChecked: boolean
	isPopState: boolean
	hasQueryParams: boolean
	queryStringUpdating: boolean
	queryStringUpdated: boolean
	currentZipCode: string|null
	optionName: string|null
}

export type Fulfillment = 'pick_up' | 'delivery'

export type FulfillmentName = 'pickup' | 'delivery'

export type PickUpLocation = {
	active: boolean
	address: {
		address1: string
		address2: string
		asString: string
		asSplit: string[]
		city: string
		state: string
		zipCode: string
	}
	attachedStorageLocationId: string|null
	id: string
	isDefault: boolean
	locationId: string
	name: string
	openHours: Hours
	title: string
}