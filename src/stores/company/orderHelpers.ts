import type { Company } from 'src/types/company'
import type { OrderByOrder_Company_Raw, OrderByOrder_Company, OrderByProduct_Company_Raw, OrderByProduct_Company, OrderItem_Company, OrderByProduct_Order_Company } from 'src/types/order'

import { get } from 'svelte/store'
import { modal } from 'src/features/modules/modal/store'
import { api } from 'src/lib/api'
import { apiV2 } from 'src/lib/apiV2'
import { orderStatuses } from 'src/lists/order-statuses'
import { statuses } from 'src/lists/statuses'
import { poliSort, formatPhone } from 'src/lib/helpers'



const paymentAlert = {
	type	: 'danger',
	title	: 'Payment Processing',
	message	: 'An unknown error occurred while trying to process a payment.',
	buttons	: { deny : 'Ok' }
}

const statusAlert = {
	type	: 'danger',
	title	: 'Status Update',
	message	: 'An error occurred while trying to update a status. Please try again. If the issue persists, please contact support at support@crofter.com.',
	buttons	: { deny : 'Ok' }
}

const maxLimit = 10

export const orderHelpersV2 = (subscribe:any, update:any) => {

	return {

		ordersFetch : async () => {

			// console.log('ordersFetch')

			const { orders:open } = await apiV2.ordersOpen()
			const { orders:closed } = await apiV2.ordersClosed()

			update((v:Company) => {

				v.orders.open	= open ? open : null
				v.orders.closed	= closed ? closed : null

				return v
			})
		},

		orderCancel : async (id:string) => {

			const { success, error } = await apiV2.orderCancel({id})

			if (success) update((v:Company) => {

				v.orders.open.find((order:any) => order.id == id)?.orderItems.forEach((orderItem:any) => orderItem.status = statuses.id('cancelled'))

				return v
			})

			return { success, error }
		},

		orderFulfill : async (id:string) => {

			const { success, error } = await apiV2.orderFulfill({id})

			if (success) update((v:Company) => {

				v.orders.open.find((order:any) => order.id == id)?.orderItems.forEach((orderItem:any) => orderItem.status = statuses.id('fulfilled'))

				return v
			})

			return { success, error }
		},

		orderReady : async (id:string) => {

			const $company: Company = get({subscribe})

			if (!$company.storageLocations) {

				const { storageLocations } = await apiV2.storageLocations()

				update((v:Company) => {v.storageLocations = storageLocations; return v})
			}

			const storageLocationId = $company.storageLocations?.find((location:any) => location.preferred)?.id || null

			const params: {id:string, set?:{storageLocationId?:string}, debug?:string} = {id}

			if (storageLocationId) params.set = {storageLocationId}

			const { success, error } = await apiV2.orderReady(params)

			if (success) {
			
				update((v:Company) => {

					v.orders.open.find((order:any) => order.id == id)?.orderItems.forEach((orderItem:any) => orderItem.status = statuses.id('ready'))

					return v
				})

			} else if (error) {

				const alert = paymentAlert

				if (error?.message) alert.message = error.message
				
				modal.open('alert', {alert})
			}

			return { success, error }
		},

		getOrderById : (id:string) => {

			const $company: Company = get({subscribe})

			if (!$company) return null

			let order = $company.orders.open?.find((order:any) => order.id == id)

			if (!order) order = $company.orders.closed?.find((order:any) => order.id == id)

			return order || null
		}
	}
}




export const orderHelpers = (subscribe:any, update:any) => {

	return {

		ordersByOrderFetch : async (distributorLocationId:string|null = null) => {

			const open		= await fetchOrders('OPEN', {distributorLocationId, orderBy:'OLDEST_CREATED'})
			const recent	= await fetchOrders('FULFILLED', {distributorLocationId, limit:maxLimit, orderBy:'LATEST_UPDATED'})
			const total		= await fetchTotal({distributorLocationId})

			update((v:Company) => {

				if (!v.ordersByOrder) v.ordersByOrder = {open:null, closed:{all:null, recent:null, total:0}}

				if	(open)	v.ordersByOrder.open = initOrders(open, v.role, distributorLocationId)
				else		v.ordersByOrder.open = null

				if	(recent)	v.ordersByOrder.closed.recent = initOrders(recent, v.role, distributorLocationId)
				else			v.ordersByOrder.closed.recent = null

				if	(total)	v.ordersByOrder.closed.total = total
				else		v.ordersByOrder.closed.total = 0

				return v
			})
		},

		ordersByOrderSearchFetch : async (distributorLocationId:string|null = null, phoneNumber:string|null = null) => {

			const open		= await fetchOrders('OPEN', {distributorLocationId, phoneNumber, orderBy:'OLDEST_CREATED'})
			const recent	= await fetchOrders('FULFILLED', {distributorLocationId, phoneNumber, limit:maxLimit, orderBy:'LATEST_UPDATED'})
			const total		= await fetchTotal({distributorLocationId, phoneNumber})

			update((v:Company) => {

				if (!v.ordersByOrderSearch) v.ordersByOrderSearch = {open:null, closed:{all:null, recent:null, total:0}}

				if	(open)	v.ordersByOrderSearch.open = initOrders(open, v.role, distributorLocationId)
				else		v.ordersByOrderSearch.open = null

				if	(recent)	v.ordersByOrderSearch.closed.recent = initOrders(recent, v.role, distributorLocationId)
				else			v.ordersByOrderSearch.closed.recent = null

				if	(total)	v.ordersByOrderSearch.closed.total = total
				else		v.ordersByOrderSearch.closed.total = 0

				return v
			})
		},

		ordersByOrderFetchAllClosed : async (distributorLocationId:string|null = null) => {

			const all = await fetchOrders('FULFILLED', {distributorLocationId, orderBy:'LATEST_UPDATED'})

			update((v:Company) => {

				if (!v.ordersByOrder) v.ordersByOrder = {open:null, closed:{all:null, recent:null, total:0}}

				if	(all)	v.ordersByOrder.closed.all = initOrders(all, v.role, distributorLocationId)
				else		v.ordersByOrder.closed.all = null

				return v
			})
		},

		ordersByOrderSearchFetchAllClosed : async (distributorLocationId:string|null = null, phoneNumber:string|null = null) => {

			const all = await fetchOrders('FULFILLED', {distributorLocationId, phoneNumber, orderBy:'LATEST_UPDATED'})

			update((v:Company) => {

				if (!v.ordersByOrderSearch) v.ordersByOrderSearch = {open:null, closed:{all:null, recent:null, total:0}}

				if	(all)	v.ordersByOrderSearch.closed.all = initOrders(all, v.role, distributorLocationId)
				else		v.ordersByOrderSearch.closed.all = null

				return v
			})
		},

		ordersByProductFetch : async (distributorLocationId:string|null = null) => {

			const products = await fetchProducts({distributorLocationId})

			update((v:Company) => {

				if (products)	v.ordersByProduct = initProducts(products, v.role, distributorLocationId)
				else			v.ordersByProduct = null

				return v
			})
		},

		ordersByProductSearchFetch : async (distributorLocationId:string|null = null, term:string|null = null) => {

			const products = await fetchProducts({distributorLocationId, term})
			
			update((v:Company) => {

				if (products)	v.ordersByProductSearch = initProducts(products, v.role, distributorLocationId)
				else			v.ordersByProductSearch = null

				return v
			})
		},

		ordersUpdateOrderStatus : async (orderId:string, newStatus:string) => {

			const { orderItems, error } = await api.orderChangeStatus({ variables:{orderId, status:newStatus} })

			if (error) {
				
				if	(orderStatuses.name(newStatus) == 'ready') {

					const alert = paymentAlert

					alert.message = alert.message.replace('ERROR_MESSAGE', ` (${error.message})`)

					modal.open('alert', {alert})
				
				} else modal.open('alert', {alert:statusAlert})
			
			} else {

				update((v:Company) => {

					if (v.ordersByOrder) v.ordersByOrder.open = updateOrderStatusForOrders(orderId, orderItems, v.ordersByOrder.open)

					if (v.ordersByProduct) v.ordersByProduct = updateOrderStatusForProducts(orderId, orderItems, v.ordersByProduct)
					
					if (v.ordersByOrderSearch) v.ordersByOrderSearch.open = updateOrderStatusForOrders(orderId, orderItems, v.ordersByOrderSearch.open)

					if (v.ordersByProductSearch) v.ordersByProductSearch = updateOrderStatusForProducts(orderId, orderItems, v.ordersByProductSearch)

					return v

				})
			}	
		},

		ordersUpdateOrderItemStatus : async (orderId:string, orderItemId:string, newStatus:string) => {

			const { status, error } = await api.orderItemChangeStatus({ variables:{orderItemId, status:newStatus} })
		
			if (error) {
				
				if	(orderStatuses.name(newStatus) == 'ready') {

					const alert = paymentAlert

					alert.message = alert.message.replace('ERROR_MESSAGE', ` (${error.message})`)
					
					modal.open('alert', {alert})
				
				} else modal.open('alert', {alert:statusAlert})
			
			} else {

				update((v:Company) => {

					if (v.ordersByOrder) v.ordersByOrder.open = updateItemStatusForOrders(orderId, orderItemId, status, v.ordersByOrder.open)

					if (v.ordersByProduct) v.ordersByProduct = updateItemStatusForProducts(orderId, orderItemId, status, v.ordersByProduct)

					if (v.ordersByOrderSearch) v.ordersByOrderSearch.open = updateItemStatusForOrders(orderId, orderItemId, status, v.ordersByOrderSearch.open)

					if (v.ordersByProductSearch) v.ordersByProductSearch = updateItemStatusForProducts(orderId, orderItemId, status, v.ordersByProductSearch)

					return v
				})
			}
		},

		ordersUpdateProductOrderStatus : async (productId:string, newStatus:string) => {

			const $company:Company	= get({subscribe})
			const products 			= $company.ordersByProduct

			if (!products) return

			// Find the target product and extract orders that need to be updated in a single pass
			const targetProduct = products.find(product => product.id === productId)

			if (!targetProduct) return

			// Filter orders that need status update in a single pass
			const ordersToUpdate = targetProduct.orders.filter(order => order.status !== newStatus)

			if (ordersToUpdate.length === 0) return

			// Create a map for faster lookups during updates
			const orderMap = new Map(ordersToUpdate.map(order => [order.orderItemId, order]))
			
			// Process API calls and update statuses
			for (const order of ordersToUpdate) {

				const orderItemId = order.orderItemId
				
				const { status, error } = await api.orderItemChangeStatus({ variables:{orderItemId, status:newStatus} })
				
				if (error) {
					
					if	(orderStatuses.name(newStatus) == 'ready')	modal.open('alert', {alert:paymentAlert})
					else											modal.open('alert', {alert:statusAlert})
					
				} else {

					// Update the status directly in the mapped order
					const orderToUpdate = orderMap.get(orderItemId)

					if (orderToUpdate) orderToUpdate.status = status
				}
			}

			// Extract all updated orders from the map
			const productOrders = Array.from(orderMap.values())

			update((v:Company) => {

				// // Update all relevant store sections
				if (v.ordersByOrder) v.ordersByOrder.open = updateProductOrderStatusForOrders(productOrders, v.ordersByOrder.open)

				if (v.ordersByProduct) v.ordersByProduct = updateProductOrderStatusForProducts(productOrders, v.ordersByProduct)

				if (v.ordersByOrderSearch) v.ordersByOrderSearch.open = updateProductOrderStatusForOrders(productOrders, v.ordersByOrderSearch.open)

				if (v.ordersByProductSearch) v.ordersByProductSearch = updateProductOrderStatusForProducts(productOrders, v.ordersByProductSearch)
		
				return v
			})
		},

		// orderCancel : async (orderId:string) => {

		// 	const $company: Company	= get({subscribe})
		// 	const companyId: string	= $company.id as string

		// 	const { result, error } = await api.orderCancel_company({variables:{companyId, orderId}})

		// 	return { result, error }
		// }
	}
}

const fetchOrders = async (status:string, params:{distributorLocationId?:string|null, limit?:number|null, phoneNumber?:string|null, orderBy?:string|null, debug?:boolean} = {distributorLocationId:null, limit:null, phoneNumber:null, orderBy:null, debug:false}) => {

	const variables:Record<string,any> = {filterBy_status:status}

	if (params.distributorLocationId != null) variables.filterBy_distributorLocationId = params.distributorLocationId

	if (params.limit != null) variables.args_limit = params.limit

	if (params.phoneNumber != null) variables.filterBy_phoneNumber = params.phoneNumber

	if (params.orderBy != null) variables.args_orderBy = params.orderBy
	
	const { orders } = await api.ordersByOrder_company({ variables, debug:params.debug })

	return orders
}

const fetchTotal = async (params:{distributorLocationId?:string|null, phoneNumber?:string|null, debug?:boolean} = {distributorLocationId:null, phoneNumber:null, debug:false}) => {

	const variables:Record<string,any> = {filterBy_status:'FULFILLED', args_orderBy:'LATEST_UPDATED'}

	if (params.distributorLocationId != null) variables.filterBy_distributorLocationId = params.distributorLocationId

	if (params.phoneNumber != null) variables.filterBy_phoneNumber = params.phoneNumber

	const { total } = await api.ordersByOrderFulfilledTotal_company({ variables, debug:params.debug })

	if (params.distributorLocationId) {

		// Only need to count orders with matching distributor location
		return total.filter((order:{orderItems:{distributorLocation?:{id:string}}[]}) =>

			order.orderItems.some((item:{distributorLocation?:{id:string}}) => item.distributorLocation?.id === params.distributorLocationId)

		).length

	} else {

		// Only need to count orders with non-distributor location items
		return total.filter((order:{orderItems:{distributorLocation?:{id:string}}[]}) => 

			order.orderItems.some((item:{distributorLocation?:{id:string}}) => !item.distributorLocation)

		).length
	}
}

const fetchProducts = async (params:{distributorLocationId?:string|null, term?:string|null, debug?:boolean} = {distributorLocationId:null, term:null, debug:false}) => {

	const variables:Record<string,any> = {filterBy_active:null}

	if (params.distributorLocationId != null) variables.filterBy_distributorLocationId = params.distributorLocationId

	if (params.term != null) variables.filterBy_term = params.term
	
	const { products } = await api.ordersByProduct_company({ variables, debug:params.debug })

	return products
}

const initOrders = (orderList:OrderByOrder_Company_Raw[], companyRole:string, distributorLocationId:string|null = null): OrderByOrder_Company[] => {

	// Early return for empty list
	if (!orderList || orderList.length === 0) return []

	// Pre-check company role to avoid redundant checks in loops
	const isDistributor	= companyRole === 'DISTRIBUTOR'
	const isProducer	= companyRole === 'PRODUCER'

	// Create new orders with optimized filtering
	const newOrderList = orderList.reduce((acc:OrderByOrder_Company[], order) => {

		// Filter and transform order items in a single pass
		const validOrderItems = order.orderItems.filter(orderItem => {

			const distributorLocation	= orderItem.distributorLocation
			const fulfillment			= orderItem.fulfillment

			// Check company role and distributor location match
			// return (isDistributor && (distributorLocation && (distributorLocationId === null || !distributorLocation.id || distributorLocationId === distributorLocation.id))) || (isProducer && !distributorLocation)
			return (isDistributor && fulfillment == 'pick_up' && ((distributorLocation && (distributorLocationId === null || !distributorLocation.id || distributorLocationId === distributorLocation.id)) || !distributorLocation)) || (isProducer && fulfillment != 'pick_up')

			
		}).map(orderItem => ({
			distributorLocation	: orderItem.distributorLocation,
			fulfillment			: orderItem.fulfillment,
			id					: orderItem.id,
			product				: orderItem.product,
			quantity			: orderItem.quantity,
			show				: true,
			status				: orderItem.status
		}))

		// Only create and add the order if it has valid items
		if (validOrderItems.length > 0) {

			acc.push({
				createdDate		: new Date(order.createdDate).toLocaleDateString('en-us'),
				fulfilledCount	: 0,
				id				: order.id,
				newCount		: 0,
				orderItems		: validOrderItems,
				readyCount		: 0,
				show			: true,
				updatedDate		: new Date(order.updatedDate).toLocaleDateString('en-us'),
				user			: {
					firstName	: order.user.firstName, 
					lastName	: order.user.lastName, 
					phoneNumber	: formatPhone(order.user.phoneNumber) as string
				}
			})

		}

		return acc

	}, [])

	return countOrder(newOrderList)
}

const initProducts = (productList:OrderByProduct_Company_Raw[], companyRole:string, distributorLocationId:string|null = null): OrderByProduct_Company[] => {

	// Early return for empty list
	if (!productList || productList.length === 0) return []

	// Pre-check company role to avoid redundant checks in loops
	const isDistributor	= companyRole === 'DISTRIBUTOR'
	const isProducer	= companyRole === 'PRODUCER'

	// Process each product with optimized order filtering
	const products = productList.reduce((acc:OrderByProduct_Company[], product) => {

		// Filter valid orders for this product
		const validOrders = product.orders
			.filter(order => {

				const distributorLocation	= order.orderItems[0].distributorLocation
				const fulfillment			= order.orderItems[0].fulfillment
				const status				= order.orderItems[0].status

				// Skip fulfilled orders
				if (orderStatuses.is('fulfilled', status)) return false

				// Check company role and location match
				// return (isDistributor && distributorLocation && (distributorLocationId === null || !distributorLocation.id || distributorLocationId === distributorLocation.id)) || (isProducer && !distributorLocation)
				return (isDistributor && fulfillment == 'pick_up' && (distributorLocation && (distributorLocationId === null || !distributorLocation.id || distributorLocationId === distributorLocation.id)) || !distributorLocation) || (isProducer && fulfillment != 'pick_up')

			}).map(order => {

				const orderItem = order.orderItems[0]

				return {
					createdDate			: new Date(order.createdDate).toLocaleDateString('en-us'),
					distributorLocation	: orderItem.distributorLocation,
					fulfillment			: orderItem.fulfillment,
					orderId				: order.id,
					orderItemId			: orderItem.id,
					quantity			: orderItem.quantity,
					status				: orderItem.status,
					unit				: product.unit,
					user				: order.user
				}
			})

		// Calculate total quantity in one pass
		const totalQuantity = validOrders.reduce((sum, order) => sum + order.quantity, 0)

		// Only add products with orders
		if (totalQuantity > 0) {

			acc.push({
				id			: product.id,
				image		: product.image,
				newCount	: 0,
				newQuantity	: 0,
				orders		: validOrders,
				quantity	: totalQuantity,
				readyCount	: 0,
				title		: product.title,
				unit		: product.unit
			})
		}

		return acc

	}, [])

	return countProduct(poliSort(products, {type:'alpha', prop:'title'}))
}

const countOrder = (orderList:OrderByOrder_Company[]): OrderByOrder_Company[] => {
		
	orderList.forEach((order, orderIndex) => {

		let fulfilledCount	= 0,
			newCount		= 0,
			readyCount		= 0

		order.orderItems.forEach((orderItem) => {

			if 		(orderItem.status == orderStatuses.id('fulfilled'))	fulfilledCount++
			else if	(orderItem.status == orderStatuses.id('new'))		newCount++
			else if	(orderItem.status == orderStatuses.id('ready')) 	readyCount++
		})

		orderList[orderIndex].fulfilledCount	= fulfilledCount
		orderList[orderIndex].newCount			= newCount
		orderList[orderIndex].readyCount		= readyCount
	})

	return orderList
}

const countProduct = (productList:OrderByProduct_Company[]): OrderByProduct_Company[] => {

	productList.forEach((product, productIndex) => {

		let newCount	= 0,
			newQuantity = 0,
			readyCount	= 0

		product.orders.forEach((order) => {

			if (order.status == orderStatuses.id('new')) {

				newCount++
				newQuantity += order.quantity

			} else if	(order.status == orderStatuses.id('ready'))	readyCount++
		})

		productList[productIndex].newCount		= newCount
		productList[productIndex].newQuantity	= newQuantity
		productList[productIndex].readyCount	= readyCount
	})

	return productList
}

const updateOrderStatusForOrders = (orderId:string, updatedOrderItems:OrderItem_Company[], orderList:OrderByOrder_Company[]|null = null): OrderByOrder_Company[] => {
	
	// Early returns for empty cases
	if (!orderList || !orderList.length) return []

	if (!updatedOrderItems || !updatedOrderItems.length) return countOrder(orderList)

	// Create a Map for faster lookups of updated order items by id
	const updatedItemsMap = new Map(updatedOrderItems.map(item => [item.id, item.status]))

	// Create a shallow copy of the orderList for immutability
	return countOrder(orderList.map(order => {

			// Only process the target order
			if (order.id !== orderId) return order

			// Create a shallow copy of the order for immutability
			return {
				...order,
				// Update order items with new statuses
				orderItems: order.orderItems.map(item => {

					// If this item has an update in our map, apply it
					const newStatus = updatedItemsMap.get(item.id)

					if (newStatus) return { ...item, status:newStatus }
					
					return item
				})
			}
		})
	)
}

const updateItemStatusForOrders = (orderId:string, orderItemId:string, status:string, orderList:OrderByOrder_Company[]|null = null) => {

	if (!orderList) return []

	const orderIndex = orderList.findIndex(order => order.id == orderId)

	const orderItemIndex = orderList[orderIndex].orderItems.findIndex(orderItem => orderItem.id == orderItemId)

	orderList[orderIndex].orderItems[orderItemIndex].status = status

	return countOrder(orderList)
}

const updateOrderStatusForProducts = (orderId:string, updatedOrderItems:OrderItem_Company[], productList:OrderByProduct_Company[]): OrderByProduct_Company[] => {
	
	// Early returns for empty cases
	if (!productList || !productList.length) return []
	
	if (!updatedOrderItems || !updatedOrderItems.length) return countProduct(productList)

	// Create a Map for faster lookups of updated order items
	const updatedItemsMap = new Map(updatedOrderItems.map(item => [item.id, item.status]))

	// Check if a status is fulfilled
	const isFulfilled = (status: string) => orderStatuses.is('fulfilled', status)

	// First pass: Process all products and their orders
	const processedProducts = productList.map(product => {

		// Track current product quantity adjustments
		let quantityAdjustment = 0
		
		// Filter and map orders in one pass
		const updatedOrders = product.orders.filter(order => {

			// Skip orders not related to the target order
			if (order.orderId !== orderId) return true

			// Get the updated status for this order item
			const newStatus = updatedItemsMap.get(order.orderItemId)
			
			// If no status update or not found, keep the order
			if (!newStatus) return true

			// If fulfilled, remove the order and adjust quantity
			if (isFulfilled(newStatus)) {

				quantityAdjustment += order.quantity

				return false // Remove this order
			}

			// Otherwise, keep the order but update its status
			order.status = newStatus

			return true

		}).map(order => {
			
			// Create a copy of each remaining order
			return { ...order }
		})

		// Return updated product with new orders and adjusted quantity
		return {
			...product,
			orders		: updatedOrders,
			quantity	: product.quantity - quantityAdjustment
		}
	})

	// Second pass: Remove products with no orders
	const finalProducts = processedProducts.filter(product => product.orders.length > 0)

	// Count and return the processed products
	return countProduct(finalProducts)
}

const updateItemStatusForProducts = (orderId:string, orderItemId:string, status:string, productList:OrderByProduct_Company[]): OrderByProduct_Company[] => {

	// Early returns for empty cases
	if (!productList || !productList.length) return []
	
	// Check if status is fulfilled once
	const isFulfilled = orderStatuses.is('fulfilled', status)

	// Process all products and their orders
	const processedProducts = productList.map(product => {

		// Track current product quantity adjustments
		let quantityAdjustment = 0
		
		// Filter and update orders in one pass
		const updatedOrders = product.orders.filter(order => {

			// Only process matching order and item IDs
			if (order.orderId !== orderId || order.orderItemId !== orderItemId) return true

			// If fulfilled, remove the order and adjust quantity
			if (isFulfilled) {

				quantityAdjustment += order.quantity

				return false // Remove this order
			}

			// Otherwise, update its status
			order.status = status

			return true

		}).map(order => {
			
			// Create a copy of each remaining order
			return { ...order }
		})

		// Return updated product with new orders and adjusted quantity
		return {
			...product,
			orders		: updatedOrders,
			quantity	: product.quantity - quantityAdjustment
		}
	})

	// Remove products with no orders
	const finalProducts = processedProducts.filter(product => product.orders.length > 0)

	// Count and return the processed products
	return countProduct(finalProducts)
}

const updateProductOrderStatusForOrders = (productOrders:OrderByProduct_Order_Company[], orderList:OrderByOrder_Company[]|null = null): OrderByOrder_Company[] => {
		
	// Early returns for empty cases
	if (!orderList || !orderList.length) return []

	if (!productOrders || !productOrders.length) return countOrder(orderList)

	// Create maps for faster lookups
	const orderMap = new Map()
	
	// Group updates by order ID for more efficient processing
	productOrders.forEach(order => {

		if (!orderMap.has(order.orderId)) orderMap.set(order.orderId, new Map())
		
		// Map order item ID -> status
		orderMap.get(order.orderId).set(order.orderItemId, order.status)
	})

	// Create a shallow copy and update only affected orders
	const updatedOrderList = orderList.map(order => {
		
		// Skip orders that don't have any updates
		if (!orderMap.has(order.id)) return order

		// Get the status updates for this order
		const itemUpdates = orderMap.get(order.id)
		
		// Create a copy with updated order items
		return {
			...order,
			orderItems: order.orderItems.map(item => {
				
				// If this item has an update, apply it
				const newStatus = itemUpdates.get(item.id)
				
				if (newStatus) return { ...item, status: newStatus }
				
				return item
			})
		}
	})

	return countOrder(updatedOrderList)
}

const updateProductOrderStatusForProducts = (productOrders:OrderByProduct_Order_Company[], productList:OrderByProduct_Company[]): OrderByProduct_Company[] => {

	// Early returns for empty cases
	if (!productList || !productList.length) return []

	if (!productOrders || !productOrders.length) return countProduct(productList)

	// Create a map for fast lookups: order ID + item ID -> status
	const ordersMap = new Map()
	
	// Pre-process all order updates for efficient access
	productOrders.forEach(order => {

		// Create a unique key combining order ID and item ID
		const key = `${order.orderId}:${order.orderItemId}`

		ordersMap.set(key, order.status)
	})

	// Check if status is fulfilled (cached function)
	const isFulfilled = (status: string) => orderStatuses.is('fulfilled', status)

	// Process all products in a single pass
	const updatedProducts = productList.map(product => {

		// Track quantity adjustments for this product
		let quantityAdjustment = 0
		
		// Update orders in this product
		const updatedOrders = product.orders.filter(order => {

			// Create lookup key
			const key = `${order.orderId}:${order.orderItemId}`
			
			// If order not in our update map, keep it unchanged
			const newStatus = ordersMap.get(key)

			if (newStatus === undefined) return true

			// If fulfilled status, remove the order and adjust quantity
			if (isFulfilled(newStatus)) {

				quantityAdjustment += order.quantity

				return false // Remove this order
			}
			
			// Otherwise update the status
			order.status = newStatus

			return true

		}).map(order => ({
			...order // Create a copy of each remaining order
		}))

		// Create updated product with new orders and quantity
		return {
			...product,
			orders		: updatedOrders,
			quantity	: product.quantity - quantityAdjustment
		}
	})

	// Remove products with no remaining orders
	const finalProducts = updatedProducts.filter(product => product.orders.length > 0)

	return countProduct(finalProducts)
}