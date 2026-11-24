import type { Cart, CartItem, CartItemParams, Preferences } from 'src/features/groups/consumer/modules/cart/types'
import type { Fulfillment, FulfillmentName } from 'src/features/groups/consumer/pages/home/types.d.ts'
type PreferenceInputs = {pickUpLocationId?:string|null, fulfillment?:Fulfillment|null}
type CalculateCostsDetails = {code:string|null, statuses:{promoApplied:boolean, hasPriceDiscount:boolean, hasDeliveryDiscount:boolean}, promo:any, error:any}

export type FulfillmentStatus = {hasPickUp:boolean, hasDelivery:boolean, hasBoth:boolean, onlyPickUp:boolean, onlyDelivery:boolean, onlyBoth:boolean}

export interface CartStore extends ReturnType<typeof setGet> {
	subscribe: (run:(value:Cart) => void, invalidate?:(value?:Cart) => void) => () => void
	init: (force?:boolean) => void
	refresh: (force?:boolean) => void
	revalidate: () => void
	clear: (force?:boolean) => void
	setCheckout: (checkout?:boolean) => void
	addItem: (skuId:string, params?:CartItemParams) => void
	updateItem: (skuId:string, params:CartItemParams) => void
	updateItemQuantity: (skuId:string, quantity:number) => void
	updateItemFulfillment: (skuId:string, fulfillmentName:FulfillmentName, id?:string|null) => void
	updateItemsFulfillment: (fulfillmentName:FulfillmentName, id?:string|null) => void
	removeItem: (skuId:string) => void
	getItemBySkuId: (skuId:string) => CartItem|null
	getItemIds: (asJson?:boolean) => string[]|string
	getItemQuantity: (skuId:string) => number
	getItemSignitures: () => string
	getItemsWithSku: () => CartItem[]
	getFulfillmentStatus: () => FulfillmentStatus
	setPreferences: (preferences:PreferenceInputs) => void
	getPreferences: () => Preferences
	validatePreferences: () => Preferences
	setDeliveryFee: (deliveryFee:string|null) => void
	setPromoCode: (promoCode:string|null) => void
	processCheckoutTotal: (promoCode?:string|null) => Promise<CalculateCostsDetails>
	whenSynchronized: (options?:{timeout?:number}) => Promise<void>
}

import { writable } from 'svelte/store'
import currency from 'currency.js'
import { get } from 'svelte/store'
import { skus as s } from 'src/stores/skus'
import { user as u } from 'src/stores/user'
import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
import { fulfillments as f } from 'src/lists/fulfillments'
import { apiV2 } from 'src/lib/apiV2'
import { storage } from 'src/lib/storage'
import { setGet } from 'src/stores/helpers'



const initialValues : Cart = {
	checkout						: false,
	count							: 0,
	deliveryChargeThreshold			: null,
	deliveryBaseFee					: null,
	deliveryDiscount				: null,
	deliveryTotal					: null,
	id								: '',
	items							: [],
	preferences						: {pickUpLocationId:null, fulfillment:null},
	promoCode						: null,
	subTotal						: null,
	subTotalWithDelivery			: null,
	priceDiscount					: null,
	discountSubTotal				: null,
	discountSubTotalWithDelivery	: null,
	tax								: null,
	total							: null,
	totalWithDelivery				: null,
	initialized						: false,
	synchronized					: false,
	syncError						: null
}

const { subscribe, update } = writable(initialValues)

const createCartStore = () : CartStore => {

	const syncDebounceTimeout = 400

	// Debounce for synchronize function
	let synchronizeDebounce: ReturnType<typeof setTimeout> | null	= null,
		synchronizeAbort: boolean									= false,
		syncInProgress: boolean										= false

	// Promise for whenSynchronized to track pending sync operations
	let syncPromise: Promise<void> | null = null


	const validatePreferences = (preferences:{pickUpLocationId?:string|null, fulfillment?:string|null}): PreferenceInputs => {

		// Handle pickUpLocationId if provided
		if ('pickUpLocationId' in preferences) {

			const id = preferences.pickUpLocationId

			// Validate location exists (null is valid for clearing)
			if (id && !pL.get(id)) preferences.pickUpLocationId = null
		}

		// Handle fulfillment if provided
		if ('fulfillment' in preferences) {

			const fulfillment = preferences.fulfillment

			// Validate fulfillment exists (null is valid for clearing)
			if (fulfillment && !f.get('id', fulfillment)) preferences.fulfillment = null
		}

		return preferences as PreferenceInputs
	}


	/**
	 * Writes and updates preferences (pick-up location and/or fulfillment)
	 * @param preferences - Object with optional pickUpLocationId and fulfillment
	 */
	const writePreferences = (preferences:PreferenceInputs) => {

		const validation: PreferenceInputs = validatePreferences(preferences)

		// Only update store if we have changes
		if (Object.keys(validation).length > 0) {

			if ('pickUpLocationId' in validation) storage.set('pick-up-location-id', validation.pickUpLocationId)

			if ('fulfillment' in validation) storage.set('fulfillment', validation.fulfillment)

			update((v:Cart) => {

				if ('pickUpLocationId' in validation) v.preferences.pickUpLocationId = validation.pickUpLocationId!

				if ('fulfillment' in validation) v.preferences.fulfillment = validation.fulfillment!

				return v
			})
		}
	}


	/**
	 * Reads and updates preferences from storage
	 * @returns Object containing validated pickUpLocationId and fulfillment
	 */
	const readPreferences = (): Preferences => {

		const $cart: Cart = get(store)

		let pickUpLocationId: string|null	= $cart.preferences.pickUpLocationId
		let fulfillment: string|null		= $cart.preferences.fulfillment

		// Track what was read from storage (before validation)
		let storedPickUpLocationId: string|null = null
		let storedFulfillment: string|null = null

		// Only read from storage if not already in store
		if (!pickUpLocationId) {

			const stored = storage.get('pick-up-location-id')?.data

			storedPickUpLocationId	= (typeof stored === 'string') ? stored : null
			pickUpLocationId		= storedPickUpLocationId
		}

		if (!fulfillment) {

			const stored = storage.get('fulfillment')?.data

			storedFulfillment	= (typeof stored === 'string') ? stored : null
			fulfillment			= storedFulfillment
		}

		// Validate preferences (clears invalid values to null)
		const beforeValidation = {pickUpLocationId, fulfillment}
		
		const validated = validatePreferences({pickUpLocationId, fulfillment})
		
		pickUpLocationId	= validated.pickUpLocationId ?? null
		fulfillment			= validated.fulfillment ?? null
		
		// Check if validation cleared any storage values
		const pickUpLocationInvalidated	= storedPickUpLocationId !== null && beforeValidation.pickUpLocationId !== pickUpLocationId
		const fulfillmentInvalidated	= storedFulfillment !== null && beforeValidation.fulfillment !== fulfillment

		// Check if store needs updating
		const pickUpLocationChanged	= $cart.preferences.pickUpLocationId !== pickUpLocationId
		const fulfillmentChanged	= $cart.preferences.fulfillment !== fulfillment

		// Update storage if validation cleared values that were read from storage
		if (pickUpLocationInvalidated) storage.set('pick-up-location-id', pickUpLocationId ?? null)

		if (fulfillmentInvalidated) storage.set('fulfillment', fulfillment ?? null)

		// Update store if values changed
		if (pickUpLocationChanged || fulfillmentChanged) update((v:Cart) => {

			if (pickUpLocationChanged) v.preferences.pickUpLocationId = pickUpLocationId ?? null

			if (fulfillmentChanged) v.preferences.fulfillment = (fulfillment ?? null) as Fulfillment|null

			return v
		})
		
		// Return validated values
		return {
			pickUpLocationId	: pickUpLocationId ?? null,
			fulfillment			: (fulfillment ?? null) as Fulfillment|null
		}
	}



	/**
	 * Filters out any items with invalid or missing SKUs, and optionally SKUs that are not active
	 * @param cartItems - Array of cart items to validate
	 * @param checkActive - If true, also filters out inactive SKUs
	 * @returns Filtered array containing only cart items with valid SKUs (and active if checkActive is true)
	 */
	const validSkuFilter = (cartItems: CartItem[], checkActive: boolean = false): CartItem[] => cartItems.filter((item: CartItem) => {

		const sku = s.getById(item.skuId)

		if (sku === undefined || sku === null) return false

		if (checkActive && sku.active !== true) return false
		
		return true
	})
	
	/**
	 * Calculates the subtotal for all cart items
	 * @param cartItems - Array of cart items to calculate subtotal for
	 * @returns Formatted currency string representing the cart subtotal
	 */
	const calculateSubTotal = (cartItems: CartItem[]): {string:string, number:number} => {

		const precision = 9
		let subTotal = currency(0, { precision })

		for (const cartItem of cartItems) {

			const sku = s.getById(cartItem.skuId)

			// Skip if SKU not found
			if (!sku) continue

			const itemTotal = currency(sku.variant.price.number, { precision }).multiply(cartItem.quantity)

			subTotal = subTotal.add(itemTotal)
		}

		return {string:currency(subTotal.value).format(), number:subTotal.value}
	}

	/**
	 * Filters out any items with quantity 0
	 * @param cartItems - Array of cart items to validate
	 * @returns Filtered array containing only cart items with quantity greater than 0
	 */
	const quantityZeroFilter = (cartItems: CartItem[]): CartItem[] => cartItems.filter((item: CartItem) => item.quantity > 0)

	/**
	 * Applies core cart operations: validates SKUs, calculates subtotal, and updates count
	 * @param cart - Cart to update
	 * @param cartItems - Cart items to process
	 * @returns Updated cart
	 */
	const coreCartUpdateFunctions = (cart:Cart, cartItems:CartItem[]) => {

		// Filter out any items with invalid or missing SKUs
		cart.items = validSkuFilter(cartItems)

		// Filter out any items with invalid or missing SKUs, and SKUs that are not active
		cartItems = validSkuFilter(cart.items, true)
		
		// Calculate the subtotal (only for items with quantity > 0)
		cart.subTotal = calculateSubTotal(quantityZeroFilter(cartItems))

		// Count items that have a quantity greater than 0
		cart.count = quantityZeroFilter(cartItems).length

		cart.tax			= null
		cart.total			= null
		cart.synchronized	= false

		return cart
	}



	/**
	 * Adds a new item to the cart
	 * @param skuId - ID of the SKU to add
	 * @param cartItems - Array of cart items to add the new item to
	 * @param params - Optional parameters for the cart item
	 * @returns Updated array of cart items
	 */
	const addItemToCartItems = (skuId:string, cartItems:CartItem[], params:CartItemParams = {}): CartItem[] => {

		// If no skuId is provided, return cartItems unchanged
		if (!skuId) return cartItems

		// If quantity is provided and less than 1, set it to 1
		if (Object.hasOwn(params, 'quantity') && (!params.quantity || params.quantity < 1)) params.quantity = 1

		// Add the item
		cartItems.push({
			id					: null,
			skuId,
			quantity			: 1,
			fulfillment			: null,
			pickUpLocationId	: null,
			deliveryAddressId	: null,
			...params
		})

		return cartItems
	}

	/**
	 * Updates an existing item in the cart
	 * @param itemIndex - Index of the item to update
	 * @param cartItems - Array of cart items to update the item in
	 * @param params - Optional parameters for the cart item
	 * @returns Updated array of cart items
	 */
	const updateItemInCartItems = (itemIndex:number, cartItems:CartItem[], params:CartItemParams = {}): CartItem[] => {

		// If no itemIndex is provided, return cartItems unchanged
		if (itemIndex < 0) return cartItems

		// If quantity is provided and less than 0, set it to 0
		if (Object.hasOwn(params, 'quantity') && (!params.quantity || params.quantity < 1)) params.quantity = 0
	
		// Update the item
		cartItems[itemIndex] = {...cartItems[itemIndex], ...params}

		return cartItems
	}

	/**
	 * Removes an item from the cart
	 * @param itemIndex - Index of the item to remove
	 * @param cartItems - Array of cart items to remove the item from
	 * @returns Updated array of cart items
	 */
	// const removeItemFromCartItems = (itemIndex:number, cartItems:CartItem[]): CartItem[] => {

	// 	// If no itemIndex is provided, return cartItems unchanged
	// 	if (itemIndex < 0) return cartItems

	// 	// Remove the item
	// 	cartItems.splice(itemIndex, 1)

	// 	return cartItems
	// }

	/**
	 * Updates the cart
	 * @param skuId - ID of the SKU to update
	 * @param callBack - Callback function to update the cart
	 */
	const updateCart = (skuId:string, callback:(itemIndex:number, cartItems:CartItem[]) => CartItem[]) => {

		// If no skuId is provided, return early
		if (!skuId) return

		update((v:Cart) => {

			const itemIndex = v.items.findIndex((item:CartItem) => item.skuId === skuId)

			return coreCartUpdateFunctions(v, callback(itemIndex, v.items))
		})
	}

	/**
	 * Saves items to the cart
	 * @param cartItems - Cart items to save
	 */
	const saveToCart = (cartItems:CartItem[]) => update((v:Cart) => coreCartUpdateFunctions(v, cartItems))

	/**
	 * Removes inactive SKUs from the cart and synchronizes with server/storage
	 * Filters current cart items to only include active SKUs, then triggers sync
	 */
	const removeInactiveItems = (): void => {

		let hasChanges = false

		update((v:Cart) => {

			const activeItems = validSkuFilter(v.items, true)

			// Check if any items were filtered out
			if (activeItems.length !== v.items.length) {

				hasChanges = true

				return coreCartUpdateFunctions(v, activeItems)
			}

			return v
		})

		// Only synchronize if items were actually removed
		if (hasChanges) synchronize(true, true)
	}

	/**
	 * Updates cart item IDs from server response and removes items with quantity 0
	 * Only updates items that are missing IDs (preserves cart as source of truth)
	 * Removes quantity 0 items after server sync confirms deletion
	 * @param serverItems - Items with IDs returned from server
	 */
	const updateCartItemIds = (serverItems:CartItem[]) => update((v:Cart) => {

		// console.log('updateCartItemIds', serverItems)

		// Create map of server items by skuId for quick lookup
		const serverItemsMap = new Map<string, CartItem>()

		for (const item of serverItems) serverItemsMap.set(item.skuId, item)

		// Update only items that are missing IDs
		for (let i = 0; i < v.items.length; i++) {

			const cartItem = v.items[i]

			// Only update if cart item is missing ID and server has one
			if (!cartItem.id) {

				const serverItem = serverItemsMap.get(cartItem.skuId)

				if (serverItem?.id) v.items[i] = {...cartItem, id:serverItem.id}
			}
		}

		// Remove items with quantity 0 after server sync
		v.items = quantityZeroFilter(v.items)

		return v
	})



	/**
	 * Sets items in storage
	 * @param cartItems - Array of cart items to set
	 */
	const setStorageItems = (cartItems:CartItem[]) => storage.set('cart', cartItems)
	
	/**
	 * Gets items from storage
	 * @returns Array of cart items from storage
	 */
	const getStorageItems = (): CartItem[] => {

		const response = storage.get('cart', 'guest')

		return Array.isArray(response?.data) ? response.data : []
	}

	/**
	 * Deletes storage items
	 */
	const deleteStorageItems = () => storage.remove('cart', 'guest')



	/**
	 * Gets items from server
	 * @param userId - ID of the user
	 * @returns Array of cart items from server (excluding quantity 0)
	 */
	const getServerItems = async (userId:string): Promise<CartItem[]> => {

		const { cartItems, success } = await apiV2.cartItems({userId})

		if (!success) return []

		// Filter out items marked for deletion (quantity 0)
		return quantityZeroFilter(cartItems)
	}

	/**
	 * Updates a single item on the server
	 * @param userId - ID of the user
	 * @param item - Cart item to update
	 * @returns The cart item ID from server, or null if failed
	 */
	const updateServerItem = async (userId:string, item:CartItem): Promise<string|null> => {

		// console.log('updateServerItem', {userId, item, synchronizeAbort})

		// Check if operation was aborted
		if (synchronizeAbort) return null

		const { cartItemId, success } = await apiV2.cartItemUpdate({set:{
			userId,
			skuId				: item.skuId,
			quantity			: item.quantity,
			fulfillment			: item.fulfillment,
			pickUpLocationId	: item.pickUpLocationId,
			deliveryAddressId	: item.deliveryAddressId
		}})

		return success ? cartItemId : null
	}

	/**
	 * Saves merged items to the server and handles deletions
	 * @param userId - ID of the user
	 * @param mergedItems - Merged cart items to save
	 * @param serverItems - Current server items for comparison
	 * @param cartItemsWithDeletions - Cart items including quantity 0 (pending deletions)
	 * @returns Updated cart items with server IDs
	 */
	const saveToServer = async (userId:string, mergedItems:CartItem[], serverItems:CartItem[], cartItemsWithDeletions:CartItem[] = []): Promise<CartItem[]> => {

		// console.log('saveToServer', {userId, mergedItems, serverItems, cartItemsWithDeletions})

		const serverItemsMap = new Map<string, CartItem>()

		for (const item of serverItems) serverItemsMap.set(item.skuId, item)

		const updatedItems = [...mergedItems]

		// First, handle deletions (items with quantity 0 in cart)
		for (const cartItem of cartItemsWithDeletions) if (cartItem.quantity === 0 && cartItem.id) await updateServerItem(userId, cartItem)

		// Then, update items that need syncing
		for (let i = 0; i < updatedItems.length; i++) {

			const item			= updatedItems[i]
			const serverItem	= serverItemsMap.get(item.skuId)

			if (needsServerUpdate(item, serverItem)) {

				const cartItemId = await updateServerItem(userId, item)

				if (cartItemId) updatedItems[i] = {...item, id:cartItemId}
			}
		}

		// Finally, delete server items not in merged items (mark with quantity 0)
		for (const [skuId, serverItem] of serverItemsMap) if (!updatedItems.some(item => item.skuId === skuId)) await updateServerItem(userId, {...serverItem, quantity:0})


		// Merge server IDs into updatedItems for items that weren't updated but exist on server
		for (let i = 0; i < updatedItems.length; i++) {

			const item = updatedItems[i]

			if (!item.id) {

				const serverItem = serverItemsMap.get(item.skuId)

				if (serverItem?.id) updatedItems[i] = {...item, id: serverItem.id}
			}
		}

		return updatedItems
	}



	/**
	 * Merges items from multiple sources with priority: source1 > source2 > source3
	 * Items are matched by skuId, with higher priority source winning conflicts
	 * @param source1 - Highest priority items (e.g., storage)
	 * @param source2 - Medium priority items (e.g., cart)
	 * @param source3 - Lowest priority items (e.g., server)
	 * @returns Merged array of cart items
	 */
	const mergeItems = (source1:CartItem[] = [], source2:CartItem[] = [], source3:CartItem[] = []): CartItem[] => {

		// console.log('mergeItems', {source1, source2, source3})

		const merged = new Map<string, CartItem>()

		// Add source3 items first (lowest priority)
		for (const item of source3) if (item.quantity > 0) merged.set(item.skuId, {...item})

		// Override with source2 items (medium priority)
		for (const item of source2) if (item.quantity > 0) merged.set(item.skuId, {...item})

		// Override with source1 items (highest priority)
		for (const item of source1) if (item.quantity > 0) merged.set(item.skuId, {...item})

		return Array.from(merged.values())
	}

	/**
	 * Checks if a cart item needs to be updated on the server
	 * Compares quantity, fulfillment, pickUpLocationId, and deliveryAddressId
	 * @param cartItem - Cart item to check
	 * @param serverItem - Server item to compare against
	 * @returns True if update is needed
	 */
	const needsServerUpdate = (cartItem:CartItem, serverItem:CartItem|undefined): boolean => {

		// console.log('needsServerUpdate', {cartItem, serverItem})

		// New item (no server equivalent)
		if (!serverItem) return true

		// Check if any relevant fields differ
		const quantityDiff			= cartItem.quantity !== serverItem.quantity
		const fulfillmentDiff		= cartItem.fulfillment !== serverItem.fulfillment
		const pickUpLocationDiff	= cartItem.pickUpLocationId !== serverItem.pickUpLocationId
		const deliveryAddressDiff	= cartItem.deliveryAddressId !== serverItem.deliveryAddressId

		return	quantityDiff || fulfillmentDiff || pickUpLocationDiff || deliveryAddressDiff
	}



	/**
	 * Synchronizes server with cart based on 8 scenarios
	 * @param userId - ID of the user
	 * @param userInitiated - If true, skip merge and just send cart state to server
	 */
	const syncServerWithCart = async (userId:string, userInitiated:boolean = false): Promise<void> => {

		// console.log('syncServerWithCart', {userId, userInitiated})

		syncInProgress = true

		try {

			// Get current cart items
			let cartItems: CartItem[] = []

			update((v:Cart) => {cartItems = [...v.items]; return v})

			// If user just made a change, skip merge and just sync cart to server
			if (userInitiated) {

				// console.log('User-initiated sync: pushing cart to server')

				// Get server items only for comparison (to detect what needs updating)
				const serverItems = await getServerItems(userId)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				// Sync cart to server (including deletions)
				const updatedItems = await saveToServer(userId, quantityZeroFilter(cartItems), serverItems, cartItems)

				// Update IDs and remove quantity 0 items
				updateCartItemIds(updatedItems)

				// Only set synchronized if we successfully completed AND were not aborted
				if (!synchronizeAbort) update((v:Cart) => {

					v.synchronized	= true
					v.initialized	= true
					v.syncError		= null

					return v
				})

				return
			}

			// Get storage and server items
			const storageItems	= getStorageItems()
			const serverItems	= await getServerItems(userId)

			// Exit if operation was aborted
			if (synchronizeAbort) return

			const hasCart		= cartItems.length > 0
			const hasServer		= serverItems.length > 0
			const hasStorage	= storageItems.length > 0

			// Scenario 1: Empty cart / empty server / empty storage
			if (!hasCart && !hasServer && !hasStorage) {

				// console.log('Scenario 1')

				// do nothing
			}

			// Scenario 2: Empty cart / items on server / empty storage
			else if (!hasCart && hasServer && !hasStorage) {

				// console.log('Scenario 2')

				saveToCart(serverItems)
			}

			// Scenario 3: Empty cart / empty server / items in storage
			else if (!hasCart && !hasServer && hasStorage) {

				// console.log('Scenario 3')

				// Load storage items into empty cart first
				saveToCart(storageItems)

				// Then sync to server and update IDs
				const updatedItems = await saveToServer(userId, storageItems, [], storageItems)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				updateCartItemIds(updatedItems)

				deleteStorageItems()
			}

			// Scenario 4: Empty cart / items on server / items in storage
			else if (!hasCart && hasServer && hasStorage) {

				// console.log('Scenario 4')

				const mergedItems = mergeItems(storageItems, [], serverItems)

				// Load merged items into empty cart first
				saveToCart(mergedItems)

				// Then sync to server and update IDs
				const updatedItems = await saveToServer(userId, mergedItems, serverItems, storageItems)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				updateCartItemIds(updatedItems)

				deleteStorageItems()
			}

			// Scenario 5: Items in cart / empty server / empty storage
			else if (hasCart && !hasServer && !hasStorage) {

				// console.log('Scenario 5')

				// Sync cart to server and update IDs (including deletions)
				const updatedItems = await saveToServer(userId, quantityZeroFilter(cartItems), [], cartItems)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				updateCartItemIds(updatedItems)
			}

			// Scenario 6: Items in cart / items on server / empty storage
			else if (hasCart && hasServer && !hasStorage) {

				// console.log('Scenario 6')

				const mergedItems = mergeItems(quantityZeroFilter(cartItems), [], serverItems)

				// Only update cart if merge resulted in changes
				const activeCartItems = quantityZeroFilter(cartItems)

				if (mergedItems.length !== activeCartItems.length || mergedItems.some((item, i) => item.skuId !== activeCartItems[i]?.skuId)) saveToCart(mergedItems)

				// Sync to server and update IDs (including deletions)
				const updatedItems = await saveToServer(userId, mergedItems, serverItems, cartItems)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				updateCartItemIds(updatedItems)
			}

			// Scenario 7: Items in cart / empty server / items in storage
			else if (hasCart && !hasServer && hasStorage) {

				// console.log('Scenario 7')

				const mergedItems = mergeItems(storageItems, quantityZeroFilter(cartItems), [])

				// Only update cart if merge resulted in changes
				const activeCartItems = quantityZeroFilter(cartItems)

				if (mergedItems.length !== activeCartItems.length || mergedItems.some((item, i) => item.skuId !== activeCartItems[i]?.skuId)) saveToCart(mergedItems)

				// Sync to server and update IDs (including deletions)
				const updatedItems = await saveToServer(userId, mergedItems, [], cartItems)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				updateCartItemIds(updatedItems)

				deleteStorageItems()
			}

			// Scenario 8: Items in cart / items on server / items in storage
			else if (hasCart && hasServer && hasStorage) {

				// console.log('Scenario 8')

				const mergedItems = mergeItems(storageItems, quantityZeroFilter(cartItems), serverItems)

				// Only update cart if merge resulted in changes
				const activeCartItems = quantityZeroFilter(cartItems)

				if (mergedItems.length !== activeCartItems.length || mergedItems.some((item, i) => item.skuId !== activeCartItems[i]?.skuId)) saveToCart(mergedItems)

				// Sync to server and update IDs (including deletions)
				const updatedItems = await saveToServer(userId, mergedItems, serverItems, cartItems)

				// Exit if operation was aborted
				if (synchronizeAbort) return

				updateCartItemIds(updatedItems)

				deleteStorageItems()
			}

			// Only set synchronized if all operations succeeded AND were not aborted
			if (!synchronizeAbort) update((v:Cart) => {

				v.synchronized	= true
				v.initialized	= true
				v.syncError		= null

				return v
			})

		} catch (error) {

			// Log the error for debugging
			console.error('Cart sync failed:', error)

			// Store the error so whenSynchronized can detect it
			update((v:Cart) => {

				v.syncError = error instanceof Error ? error : new Error(String(error))

				return v
			})

		} finally {

			synchronizeDebounce	= null
			syncInProgress		= false
		}
	}

	/**
	 * Synchronizes the cart with local storage
	 */
	const syncStorageWithCart = () => {
		
		syncInProgress = true
		
		update((v:Cart) => {

			try {

				// Check for items with quantity > 0
				const activeItems = quantityZeroFilter(v.items)

				// If cart has active items, save only those to storage
				if (activeItems.length > 0) setStorageItems(activeItems)
				
				// If no active items but cart has items (pending deletions), clean up
				else if (v.items.length > 0) {
					
					deleteStorageItems()
					
					// Remove quantity 0 items now that storage is cleaned up
					v.items = []
				}
				
				// If cart is truly empty, restore from storage
				else {

					const storageItems = getStorageItems()

					if (storageItems.length > 0) {

						// Update cart with storage items
						v = coreCartUpdateFunctions(v, storageItems)

						// Set the cart in storage in case some items were removed via validation
						setStorageItems(quantityZeroFilter(v.items))
					}
				}

				// Remove items with quantity 0 after sync
				v.items = quantityZeroFilter(v.items)

				// Only set synchronized if all operations succeeded
				v.synchronized	= true
				v.initialized	= true
				v.syncError		= null

			} catch (error) {

				// Log the error for debugging
				// console.error('Cart storage sync failed:', error)

				// Store the error
				v.syncError = error instanceof Error ? error : new Error(String(error))
			}

			return v
		})
		
		syncInProgress = false
	}

	/**
	 * Synchronizes the cart with the server and local storage
	 * @param userInitiated - If true, indicates sync was triggered by user action
	 */
	const executeSync = async (userInitiated:boolean = false) => {

		// console.log('executeSync', {userInitiated, userId:u.get().id})

		// Reset abort flag for this operation
		synchronizeAbort = false

		const userId = u.get().id

		// Sync server with cart if user is logged in
		if (userId) syncServerWithCart(userId, userInitiated)

		// Update local storage if user is not logged in
		else syncStorageWithCart()

		synchronizeDebounce = null
	}

	/**
	 * Synchronizes the cart with the server and local storage
	 * @param force - Whether to force a synchronization
	 * @param userInitiated - If true, indicates sync was triggered by user action
	 */
	const synchronize = (force:boolean = false, userInitiated:boolean = false) => {

		// console.log('synchronize', {force, userInitiated})

		// Clear any existing debounce timeout and abort any running operation
		if (synchronizeDebounce) {

			clearTimeout(synchronizeDebounce)

			synchronizeAbort = true
		}

		// If force is true, execute immediately without debounce
		if (force) executeSync(userInitiated)

		// Otherwise, use debounce
		else synchronizeDebounce = setTimeout(() => executeSync(userInitiated), syncDebounceTimeout)
	}


	// Store
	const store = {subscribe, ...setGet(subscribe, update),

		/**
		 * Initializes the cart
		 */
		init : (force:boolean = true): void => {

			// console.log('init')

			update((v:Cart) => {

				v.checkout		= false
				v.initialized	= false

				return v
			})

			readPreferences()

			synchronize(force)
		},

		/**
		 * Refreshes the cart
		 */
		refresh : (force:boolean = true): void => {

			// console.log('refresh')

			readPreferences()
			
			synchronize(force)
		},

		/**
		 * Revalidates cart items against current SKU data
		 * Recalculates totals and counts based on current SKU prices/availability
		 * Does NOT remove items - inactive items remain visible in cart
		 * Use this after SKU data is updated to ensure cart reflects current prices
		 */
		revalidate : (): void => {

			update((v:Cart) => coreCartUpdateFunctions(v, v.items))
		},

		/**
		 * Clears the cart
		 */
		clear : (force:boolean = true): void => {

			// console.log('clear')

			update((v:Cart) => {
				
				v = {
					...v,
					count						: 0,
					deliveryBaseFee				: null,
					deliveryDiscount			: null,
					deliveryTotal				: null,
					items						: [],
					promoCode					: null,
					subTotal					: null,
					subTotalWithDelivery		: null,
					priceDiscount				: null,
					discountSubTotal			: null,
					discountSubTotalWithDelivery: null,
					tax							: null,
					total						: null,
					totalWithDelivery			: null,
					synchronized				: false,
					syncError					: null
				}
				
				return v
			})

			synchronize(force)
		},

		/**
		 * Sets the checkout flag
		 * @param checkout - Whether the cart is for checkout
		 */
		setCheckout : (checkout:boolean = true): void => {

			update((v:Cart) => {v.checkout = checkout; return v})

			// Remove inactive items when entering checkout
			if (checkout) removeInactiveItems()
		},

		/**
		 * Adds a new item to the cart
		 * @param skuId - ID of the SKU to add
		 * @param params - Optional parameters for the cart item
		 */
		addItem : (skuId:string, params:CartItemParams = {}): void => {

			// console.log('addItem', {skuId, params})

			let forceSync = false

			updateCart(skuId, (itemIndex:number, cartItems:CartItem[]) => {

				const itemExists = itemIndex > -1
				
				forceSync = !itemExists

				// If the item exists, reset it with the provided params
				if (itemExists) return updateItemInCartItems(itemIndex, cartItems, {quantity:1, fulfillment:null, pickUpLocationId:null, deliveryAddressId:null, ...params})
				
				// If the item does not exist, add it
				else return addItemToCartItems(skuId, cartItems, params)
			})

			// Synchronize the cart with the server
			synchronize(forceSync, true)
		},

		/**
		 * Updates an existing item in the cart
		 * @param skuId - ID of the SKU to update
		 * @param params - Optional parameters for the cart item
		 */
		updateItem : (skuId:string, params:CartItemParams = {}): void => {

			// console.log('updateItem', {skuId, params})

			let forceSync = false

			updateCart(skuId, (itemIndex:number, cartItems:CartItem[]) => {

				const itemExists = itemIndex > -1

				forceSync = !itemExists
				
				// If the item exists, update it
				if (itemExists) return updateItemInCartItems(itemIndex, cartItems, params)

				// If the item does not exist, add it
				else return addItemToCartItems(skuId, cartItems, params)
			})

			// Synchronize the cart with the server
			synchronize(forceSync, true)
		},

		/**
		 * Updates the quantity of an item in the cart
		 * @param skuId - ID of the SKU to update
		 * @param quantity - Quantity to update
		 */
		updateItemQuantity : (skuId:string, quantity:number): void => {

			// console.log('updateQuantity', {skuId, quantity})

			let forceSync = false

			updateCart(skuId, (itemIndex:number, cartItems:CartItem[]) => {

				const itemExists = itemIndex > -1

				forceSync = !itemExists

				// If the item exists, update it
				if (itemExists) return updateItemInCartItems(itemIndex, cartItems, {quantity})

				// If the item does not exist, add it
				else return addItemToCartItems(skuId, cartItems, {quantity})
			})

			// Synchronize the cart with the server
			synchronize(forceSync, true)
		},

		/**
		 * Updates the fulfillment of an item in the cart
		 * @param skuId - ID of the SKU to update
		 * @param fulfillmentName - Name of the fulfillment to update
		 * @param id - ID of the fulfillment to update
		 */
		updateItemFulfillment : (skuId:string, fulfillmentName:FulfillmentName, id:string|null = null): void => {

			// console.log('updateItemFulfillment', {skuId, fulfillmentName, id})

			const fulfillment	= f.id(fulfillmentName)
			const params		= {
				fulfillment,
				pickUpLocationId	: fulfillmentName == 'pickup' ? id : null,
				deliveryAddressId	: fulfillmentName == 'delivery' ? id : null}

			let forceSync = false

			updateCart(skuId, (itemIndex:number, cartItems:CartItem[]) => {

				const itemExists = itemIndex > -1

				forceSync = !itemExists

				// If the item exists, update it
				if (itemExists) return updateItemInCartItems(itemIndex, cartItems, params)

				// If the item does not exist, add it
				else return addItemToCartItems(skuId, cartItems, params)
			})

			// Synchronize the cart with the server
			synchronize(forceSync, true)
		},

		/**
		 * Updates the fulfillment of all items in the cart
		 * @param fulfillmentName - Name of the fulfillment to update
		 * @param id - ID of the fulfillment to update
		 */
		updateItemsFulfillment : (fulfillmentName:FulfillmentName, id:string|null = null): void => {

			// console.log('updateItemsFulfillment', {fulfillmentName, id})

			const fulfillment			= f.id(fulfillmentName)
			const pickUpLocationId		= fulfillmentName == 'pickup' ? id : null
			const deliveryAddressId		= fulfillmentName == 'delivery' ? id : null

			update((v:Cart) => {

				// Map over items to create new array with updated fulfillment
				v.items = v.items.map(item => ({
					...item,
					fulfillment,
					pickUpLocationId,
					deliveryAddressId
				}))

				return v
			})

			// Synchronize the cart with the server
			synchronize(false, true)
		},

		/**
		 * Removes an item from the cart
		 * @param skuId - ID of the SKU to remove
		 * @returns True if the item was removed, false otherwise
		 */
		removeItem : (skuId:string): void => {

			// console.log('removeItem', {skuId})

			let forceSync = false

			updateCart(skuId, (itemIndex:number, cartItems:CartItem[]) => {

				const itemExists = itemIndex > -1

				forceSync = itemExists

				// If the item exists, remove it
				if (itemExists) return updateItemInCartItems(itemIndex, cartItems, {quantity:0})

				// If the item does not exist, do nothing
				else return cartItems
			})

			// Synchronize the cart with the server
			synchronize(forceSync, true)
		},

		/**
		 * Gets an item by its SKU ID
		 * @param skuId - ID of the SKU to get
		 * @returns Cart item with the specified SKU ID or null if not found
		 */
		getItemBySkuId : (skuId:string): CartItem|null => {

			// console.log('getItemBySkuId')

			const $cart: Cart = get(store)

			return $cart.items.find((cartItem:CartItem) => cartItem.skuId == skuId) ?? null
		},

		/**
		 * Gets the cart item IDs
		 * @param asJson - Whether to return the IDs as a JSON string
		 * @returns Array of cart item IDs of items with valid/active SKUs, quantity > 0, and non-null IDs
		 */
		getItemIds : (asJson:boolean = true): string[]|string => {

			// console.log('getItemIds')

			const $cart: Cart = get(store)
			
			// Filter to only valid and active SKUs
			const validActiveItems = validSkuFilter($cart.items, true)
			
			const cartItemIds = validActiveItems
				.filter((cartItem:CartItem) => cartItem.quantity > 0 && cartItem.id !== null)
				.map((cartItem:CartItem) => cartItem.id as string)

			return asJson ? JSON.stringify(cartItemIds) : cartItemIds
		},

		/**
		 * Gets the quantity of an item in the cart
		 * @param skuId - ID of the SKU to get the quantity for
		 * @returns Quantity of the specified SKU in the cart
		 */
		getItemQuantity : (skuId:string): number => {

			// console.log('getItemQuantity')

			const $cart: Cart = get(store)
			
			return $cart.items.find((cartItem:CartItem) => cartItem.skuId == skuId)?.quantity ?? 0
		},

		/**
		 * Gets the cart item signatures
		 * @returns String of cart item signatures of items with quantity > 0 and non-null IDs
		 */
		getItemSignitures : (): string => {

			// console.log('getItemSignitures')

			const $cart: Cart = get(store)
			
			return $cart.items
				.filter((cartItem:CartItem) => cartItem.quantity > 0 && cartItem.id !== null)
				.map((cartItem:CartItem) => `${cartItem.id}:${cartItem.quantity}`)
				.join('|')
		},

		/**
		 * Gets all items in the cart with their associated SKU data
		 * @returns Array of cart items with associated SKU data
		 */
		getItemsWithSku : (): CartItem[] => {

			// console.log('getItemsWithSku')

			const $cart: Cart = get(store)
			
			const precision = 9

			return quantityZeroFilter($cart.items)
				.map(item => {

					const sku	= s.getById(item.skuId)
					const total	= currency(sku?.variant?.price.number || 0, { precision }).multiply(item.quantity)

					return sku ? {...item, sku, total:{string:currency(total.value).format(), number:total.value}} : null
				})
				.filter(item => item !== null) as CartItem[]
		},

		/**
		 * Gets the fulfillment status of the cart
		 * @returns Object containing hasPickUp, hasDelivery, hasMix, onlyPickUp, and onlyDelivery
		 */
		getFulfillmentStatus : (): FulfillmentStatus => {

			let hasPickUp		= false,
				hasDelivery		= false,
				hasBoth			= false,
				onlyPickUp		= false,
				onlyDelivery	= false,
				onlyBoth		= true

			const $cart: Cart = get(store)

			$cart.items.forEach((item: CartItem) => {

				if (item.quantity === 0) return

				const sku = s.getById(item.skuId)

				if (sku?.canPickUp) hasPickUp = true
				if (sku?.canDeliver) hasDelivery = true
				
				if (!sku?.canPickUp || !sku?.canDeliver) onlyBoth = false
			})

			if (hasPickUp && !hasDelivery) onlyPickUp = true
			if (hasDelivery && !hasPickUp) onlyDelivery = true
			if (hasPickUp && hasDelivery) hasBoth = true
			
			if ($cart.items.filter(item => item.quantity > 0).length === 0) onlyBoth = false

			return {hasPickUp, hasDelivery, hasBoth, onlyPickUp, onlyDelivery, onlyBoth}
		},

		/**
		 * Sets the preferences for the cart
		 * @param preferences - Object containing optional pickUpLocationId and fulfillment
		 */
		setPreferences : (preferences:PreferenceInputs): void => writePreferences(preferences),

		/**
		 * Gets the preferences for the cart
		 * @returns Object containing pickUpLocationId and fulfillment
		 */
		getPreferences : (): Preferences => readPreferences(),

		/**
		 * Validates the preferences for the cart
		 * @returns Object containing validated pickUpLocationId and fulfillment
		 */
		validatePreferences : (): Preferences => readPreferences(),

		/**
		 * Sets the delivery fee for the cart
		 * @param deliveryFee - Delivery fee to set
		 */
		setDeliveryFee : (deliveryFee:string|null = null): void => update((v:Cart) => {

			// console.log('setDeliveryFee')

			const fee = deliveryFee ? currency(deliveryFee) : null

			if (!fee || isNaN(fee.value)) return v

			if (v.deliveryBaseFee?.string == fee.format()) return v

			const precision = 9

			if (v.total) {

				if (fee) {

					if	(v.deliveryBaseFee) {

						const total = currency(v.total.number, { precision }).subtract(v.deliveryBaseFee.number).add(fee.value)
						
						v.total = {string:currency(total.value).format(), number:total.value}

					} else {

						const total = currency(v.total.number, { precision }).add(fee.value)

						v.total = {string:currency(total.value).format(), number:total.value}
					}

					v.deliveryBaseFee = {string:fee.format(), number:fee.value}

				} else if (v.deliveryBaseFee) {

					const total = currency(v.total.number, { precision }).subtract(v.deliveryBaseFee.number)

					v.total				= {string:currency(total.value).format(), number:total.value}
					v.deliveryBaseFee	= null
				}

			} else if (fee) v.deliveryBaseFee = {string:fee.format(), number:fee.value}
			else v.deliveryBaseFee = null

			return v
		}),

		/**
		 * Sets the promotion code for the cart
		 * @param code - Promotion code to set
		 */
		setPromoCode : (code:string|null = null): void => update((v:Cart) => {v.promoCode = code; return v}),

		/**
		 * Gets the checkout total for the cart
		 * @returns Checkout total for the cart
		 */
		processCheckoutTotal : async (promoCode:string|null = null): Promise<CalculateCostsDetails> => {

			const $cart				= get(store)
			const storedPromoCode	= $cart.promoCode
			const orderItemIds		= quantityZeroFilter($cart.items).map(item => item.id)
			const response			= {
				code		: null,
				statuses	: {
					promoApplied		: false,
					hasPriceDiscount	: false,
					hasDeliveryDiscount	: false,
				},
				promo		: null,
				error		: null
			} as CalculateCostsDetails

			// console.log('processCheckoutTotal', {promoCode, storedPromoCode})

			const set:{orderItemIds:(string|null)[]; code?:string} = {orderItemIds}

			response.code = promoCode || storedPromoCode
		
			if (response.code) set.code = response.code

			const { details, error } = await apiV2.calculateCosts({set})

			// console.log('processCheckoutTotal', {details, error})

			if (error) {

				response.error = error
				
				// console.error('processCheckoutTotal', error)
				
				return response
			}

			response.promo							= details.promo
			response.statuses.promoApplied			= details.promoApplied
			response.statuses.hasPriceDiscount		= details.hasPriceDiscount
			response.statuses.hasDeliveryDiscount	= details.hasDeliveryDiscount

			update((v:Cart) => {

				const precision								= 9
				const deliveryChargeThresholdNumber			= details.deliveryChargeThreshold.number
				const deliveryDiscount						= currency(details.deliveryBaseFee?.number || 0, { precision }).subtract(currency(details.deliveryTotal.number || 0, { precision }))
				const priceDiscount							= currency(v.subTotal?.number || 0, { precision }).subtract(currency(details.subTotal?.number || 0, { precision }))
				const subTotalWithDelivery					= currency(v.subTotal?.number || 0, { precision }).add(currency(details.deliveryTotal.number || 0, { precision }))
				const discountSubTotalWithDelivery			= currency(details.subTotal.number || 0, { precision }).add(currency(details.deliveryTotal.number || 0, { precision }))
				const totalWithDelivery						= currency(details.total.number, { precision }).add(currency(details.deliveryTotal.number, { precision }))
				const deliveryDiscountDisplay				= currency(deliveryDiscount.value)
				const priceDiscountDisplay					= currency(priceDiscount.value)
				const subTotalWithDeliveryDisplay			= currency(subTotalWithDelivery.value)
				const discountSubTotalWithDeliveryDisplay	= currency(discountSubTotalWithDelivery.value)
				const totalWithDeliveryDisplay				= currency(totalWithDelivery.value)

				v.promoCode						= details.promo ? details.promo.code : null
				v.deliveryDiscount				= {string:deliveryDiscountDisplay.format(), number:deliveryDiscountDisplay.value}
				v.priceDiscount					= {string:priceDiscountDisplay.format(), number:priceDiscountDisplay.value}
				v.subTotalWithDelivery			= v.subTotal && deliveryChargeThresholdNumber <= v.subTotal.number
													? v.subTotal
													: {string:subTotalWithDeliveryDisplay.format(), number:subTotalWithDeliveryDisplay.value}
				v.discountSubTotal				= details.subTotal
				v.discountSubTotalWithDelivery	= v.subTotal && deliveryChargeThresholdNumber <= v.subTotal.number
													? details.subTotal
													: {string:discountSubTotalWithDeliveryDisplay.format(), number:discountSubTotalWithDeliveryDisplay.value}
				v.deliveryChargeThreshold		= details.deliveryChargeThreshold
				v.deliveryBaseFee				= details.deliveryBaseFee
				v.deliveryTotal					= details.deliveryTotal
				v.tax							= details.tax
				v.total							= details.total
				v.totalWithDelivery				= v.subTotal && deliveryChargeThresholdNumber <= v.subTotal.number
													? details.total
													: {string:totalWithDeliveryDisplay.format(), number:totalWithDeliveryDisplay.value}

				return v
			})

			return response
		},

		/**
		 * Waits for the cart to be synchronized
		 * @param options - Optional timeout in milliseconds
		 * @returns Promise that resolves when synchronized, rejects on error or timeout
		 */
		whenSynchronized: async (options?: {timeout?: number}): Promise<void> => {

			// console.log('whenSynchronized')

			const timeout = options?.timeout

			const waitForSync = async (): Promise<void> => {

				const $cart = get(store)

				// Already synchronized, return immediately
				if ($cart.synchronized) return

				// Sync failed - reject immediately with the error
				if ($cart.syncError) throw $cart.syncError

				// If sync already in progress, wait for it to complete
				if (syncInProgress || synchronizeDebounce) {

					let checkInterval: ReturnType<typeof setInterval> | null = null

					return new Promise<void>((resolve, reject) => {

						checkInterval = setInterval(() => {

							const current = get(store)

							if (current.synchronized) {

								if (checkInterval) clearInterval(checkInterval)

								resolve()

							} else if (current.syncError) {

								if (checkInterval) clearInterval(checkInterval)

								reject(current.syncError)
							}

						}, 50)
					})
				}

				// If sync not in progress, trigger it and create promise
				if (!syncPromise) {

					let checkInterval: ReturnType<typeof setInterval> | null = null

					syncPromise = new Promise<void>((resolve, reject) => {

						// Trigger sync with force=true (only if no sync is in progress)
						synchronize(true)

						// Poll for result
						checkInterval = setInterval(() => {

							const current = get(store)

							if (current.synchronized) {

								if (checkInterval) clearInterval(checkInterval)

								syncPromise = null

								resolve()

							} else if (current.syncError) {

								if (checkInterval) clearInterval(checkInterval)

								syncPromise = null

								reject(current.syncError)
							}

						}, 50)
					})

					// Clean up interval if promise is rejected externally (e.g., timeout)
					syncPromise.catch(() => {

						if (checkInterval) clearInterval(checkInterval)

						syncPromise = null
					})
				}

				return syncPromise
			}

			// With timeout if specified
			if (timeout) {

				return Promise.race([
					waitForSync(),
					new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Cart sync timeout')), timeout))
				])
			}

			// Without timeout (strict - wait forever or fail on error)
			return waitForSync()
		}
	}

	return store
}

export const cart = createCartStore()