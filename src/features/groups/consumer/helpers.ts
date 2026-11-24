import type { Fulfillment } from 'src/types/common'

// Generic interface for any item with fulfillment and distributorLocation
interface ItemWithFulfillment {
	fulfillment: Fulfillment
	skuId: string
}

// Keep OrderItem type for backward compatibility
// type OrderItem = ItemWithFulfillment

type OrderGroupItem = {
	status: string
}

import { skus as s } from 'src/stores/skus'
import { fulfillments as f } from 'src/lists/fulfillments'
import { orderStatuses } from 'src/lists/order-statuses'



export const groupOrderItems = <T extends ItemWithFulfillment>(items: T[]): { 
	pickUpItems: T[], 
	deliveryItems: T[] 
} => {

	// Early return for empty items
	if (!items || !items.length) return { 
		pickUpItems: [], 
		deliveryItems: [] 
	}

	// Cache fulfillment type IDs for better performance
	const pickUpId		= f.id('pickup')
	const deliveryId	= f.id('delivery')
	
	// Process all items in a single reduce operation
	return items.reduce<{
		pickUpItems: T[]
		deliveryItems: T[]
	}>(
		(result, item) => {

			const skuId			= item.skuId
			const fulfillment	= item.fulfillment
			const sku			= s.getById(skuId)

			if		(fulfillment === deliveryId)	result.deliveryItems.push({...item, sku})
			else if (fulfillment === pickUpId)		result.pickUpItems.push({...item, sku})									
			else									console.error('groupOrderItems: Invalid fulfillment type: ' + fulfillment)									

			return result
		},
		{ pickUpItems: [], deliveryItems: [] }
	)
}

export const getStatusCounts = (group:OrderGroupItem[]): {fulfilled: boolean, itemCount: number, fulfilledCount: number, newCount: number, readyCount: number} => {

	const itemCount	= group.length
	
	let fulfilled		= true,
		fulfilledCount	= 0,
		newCount		= 0,
		readyCount		= 0

	for (const item of group) {

		if (item.status != 'FULFILLED') fulfilled = false

		if 		(item.status == orderStatuses.id('fulfilled'))	fulfilledCount++
		else if	(item.status == orderStatuses.id('new'))		newCount++
		else if	(item.status == orderStatuses.id('ordered'))	newCount++
		else if	(item.status == orderStatuses.id('ready'))		readyCount++
	}

	return {fulfilled, itemCount, fulfilledCount, newCount, readyCount}	
}