import { type FulfillmentStatus, cart as c } from 'src/features/groups/consumer/modules/cart/store'



let currentCount: number = 0

// Check if cart has pick up items and delivery items
export const fulfillmentTypesCheck = (count:number, fulfillmentStatus:FulfillmentStatus): FulfillmentStatus => {

	if (count == currentCount || count == 0) return fulfillmentStatus

	currentCount = count
	
	return c.getFulfillmentStatus()
}

export const clearFulfillmentTypeCheck = () => currentCount = 0


let currentFulfillment: string				= '',
	currentPickUpLocationId: string|null	= null,
	currentAddressId: string|null			= null,
	debounceTimer: ReturnType<typeof setTimeout> | null = null

// Set fulfillment details
export const setFulfillmentDetails = (fulfillmentName:any, pickUpLocationId:string|null, deliveryAddressId:string|null, count:number, submitting:boolean, debounceTimeout:number): void => {

	// Clear existing timer
	if (debounceTimer) clearTimeout(debounceTimer)

	// Check if any value actually changed
	if (fulfillmentName === currentFulfillment && pickUpLocationId === currentPickUpLocationId && deliveryAddressId === currentAddressId) return

	// Prevent running during initial render or when cart is empty
	if ((fulfillmentName == 'pickup' && !pickUpLocationId) || (fulfillmentName == 'delivery' && !deliveryAddressId) || count === 0 || submitting) return

	// Debounce the fulfillment update
	debounceTimer = setTimeout(() => {

		// Update tracked values
		currentFulfillment			= fulfillmentName
		currentPickUpLocationId		= pickUpLocationId
		currentAddressId			= deliveryAddressId
		
		// if	(fulfillmentOption == 'delivery')	c.setDeliveryFee(hasFreeDelivery ? null : deliveryFee)
		// else									c.setDeliveryFee(null)

		c.updateItemsFulfillment(fulfillmentName, fulfillmentName == 'pickup' ? pickUpLocationId : deliveryAddressId)

		debounceTimer = null

	}, debounceTimeout)
}

export const clearFulfillmentDetails = () => {

	// Clear any pending debounce timer
	if (debounceTimer) {
		clearTimeout(debounceTimer)
		debounceTimer = null
	}

	currentFulfillment		= ''
	currentPickUpLocationId	= null
	currentAddressId		= null
}


export const validationCheck = async (fulfillmentName:string, pickUpLocationId:string|null, deliveryAddressId:string|null, validPayment:boolean, count:number, submitting:boolean): Promise<boolean> => {
	
	if (((fulfillmentName == 'pickup' && pickUpLocationId) || (fulfillmentName == 'delivery' && deliveryAddressId)) && validPayment && count > 0 && !submitting) {
		
		await c.whenSynchronized()

		return true
	}

	return false
}