type ApiV2 = {
	[key: string]: (options?: Record<string, any>) => Promise<Record<string, any>>
}

import { api } from 'src/lib/server/apiV2/helpers'
import { unions } from 'src/lib/server/apiV2/unions'
import { generateCorrelationId } from 'src/lib/utils/correlationId'
import { errorCodes } from 'src/lists/error-codes'
import { reporter, buildArgs } from 'src/lib/reporter/module'


const reportError = reporter({ type: 'error', file: 'src/lib/server/apiV2/api.ts' })

// Internal API methods without error handling
const apiV2Internal: ApiV2 = {

	// main api endpoints
	// get (when id is provided), post (when attributes are provided), patch (when both are provided), returns object 
	pickupLocation : async (options: Record<string,any> = {}) => await api('pickupLocations', {key:'pickupLocation', ...options, fieldName:'pickupLocation', isMany:false }),
	// get only (no id), returns array
	pickupLocations : async (options: Record<string,any> = {}) => await api('pickupLocations', {key:'pickupLocations', ...options, fieldName:'pickupLocation', isMany:true }),

	product : async (options: Record<string,any> = {}) => await api('products', {key:'product', ...options, fieldName:'product', isMany:false }),
	products : async (options: Record<string,any> = {}) => await api('products', {key:'products', ...options, fieldName:'product', isMany:true }),

	sku : async (options: Record<string,any> = {}) => await api('skus', {key:'sku', ...options, fieldName:'sku', isMany:false }),
	skus : async (options: Record<string,any> = {}) => await api('skus', {key:'skus', ...options, fieldName:'sku', isMany:true }),

	stockItem : async (options: Record<string,any> = {}) => await api('stockItems', {key:'stockItem', ...options, fieldName:'stockItem', isMany:false }),
	stockItemAdjust : async (options: Record<string,any> = {}) => await api('stockItems', {key:'stockItemAdjust', ...options, fieldName:'stockItem', isMany:false, path:'adjust' }),
	stockItems : async (options: Record<string,any> = {}) => await api('stockItems', {key:'stockItems', ...options, fieldName:'stockItem', isMany:true }),

	orderItem : async (options: Record<string,any> = {}) => await api('orderItems', {key:'orderItem', ...options, fieldName:'orderItem', isMany:false }),
	orderItems : async (options: Record<string,any> = {}) => await api('orderItems', {key:'orderItems', ...options, fieldName:'orderItem', isMany:true }),
	orderItemsCalculateCosts : async (options: Record<string,any> = {}) => await api('orderItems', {key:'salesTax', ...options, method:'patch', fieldName:'orderItem', setProperty:'none', isMany:true, path:'calculateCosts' }),

	order : async (options: Record<string,any> = {}) => await api('orders', {key:'order', ...options, fieldName:'order', isMany:false }),
	orderCancel : async (options: Record<string,any> = {}) => await api('orders', {key:'orderCancel', ...options, method:'patch', fieldName:'order', isMany:false, path:'cancel' }),
	orderFulfill : async (options: Record<string,any> = {}) => await api('orders', {key:'orderFulfill', ...options, method:'patch', fieldName:'order', isMany:false, path:'fulfill' }),
	orderReady : async (options: Record<string,any> = {}) => await api('orders', {key:'orderReady', ...options, method:'patch', fieldName:'order', isMany:false, path:'ready' }),
	orders : async (options: Record<string,any> = {}) => await api('orders', {key:'orders', ...options, fieldName:'order', isMany:true }),

	storageLocation : async (options: Record<string,any> = {}) => await api('storageLocations', {key:'storageLocation', ...options, fieldName:'storageLocation', isMany:false }),
	storageLocations : async (options: Record<string,any> = {}) => await api('storageLocations', {key:'storageLocations', ...options, fieldName:'storageLocation', isMany:true }),

	promotion : async (options: Record<string,any> = {}) => await api('promotions', {key:'promotion', ...options, fieldName:'promotion', isMany:false }),
	promotions : async (options: Record<string,any> = {}) => await api('promotions', {key:'promotions', ...options, fieldName:'promotion', isMany:true }),

	user : async (options: Record<string,any> = {}) => await api('users', {key:'user', ...options, fieldName:'user', isMany:false }),
	users : async (options: Record<string,any> = {}) => await api('users', {key:'users', ...options, fieldName:'user', isMany:true }),
	me : async (options: Record<string,any> = {}) => await api('users', {key:'user', ...options, fieldName:'user', isMany:false, path:'me' }),


	// custom endpoints
	// models
	locations : async (options: Record<string,any> = {}) => await apiV2Internal.pickupLocations({...options, model:'locations'}),
	cartItems : async (options: Record<string,any> = {}) => await apiV2Internal.orderItems({...options, model:'cartItems'}),
	cartItemAdd : async (options: Record<string,any> = {}) => await apiV2Internal.orderItem({...options, model:'cartItemAdd'}),
	cartItemUpdate : async (options: Record<string,any> = {}) => await apiV2Internal.orderItem({...options, model:'cartItemUpdate'}),
	cartItemDelete : async (options: Record<string,any> = {}) => await apiV2Internal.orderItem({...options, model:'cartItemDelete'}),
	skusOrderedByCompany : async (options: Record<string,any> = {}) => await apiV2Internal.skus({...options, model:'skusOrderedByCompany'}),
	calculateCosts : async (options: Record<string,any> = {}) => await apiV2Internal.orderItemsCalculateCosts({...options, model:'calculateCosts'}),
	orderSubmit : async (options: Record<string,any> = {}) => await apiV2Internal.orders({...options, model:'orderSubmit'}),
	customerOrder : async (options: Record<string,any> = {}) => await apiV2Internal.order({...options, model:'customerOrder'}),
	customerOrders : async (options: Record<string,any> = {}) => await apiV2Internal.orders({...options, model:'customerOrders'}),
	ordersOpen : async (options: Record<string,any> = {}) => await apiV2Internal.orders({...options, model:'ordersOpen'}),
	ordersClosed : async (options: Record<string,any> = {}) => await apiV2Internal.orders({...options, model:'ordersClosed'}),
	orderDetails : async (options: Record<string,any> = {}) => await apiV2Internal.order({...options, model:'orderDetails'}),
	variants : async (options: Record<string,any> = {}) => await apiV2Internal.products({...options, model:'variants'}),
	userByToken : async (options: Record<string,any> = {}) => await apiV2Internal.me({...options, model:'userByToken'}),
	productListItems : async (options: Record<string,any> = {}) => await apiV2Internal.products({...options, model:'productListItems'}),
	
	// unions
	customerOrder_skusVariantProductCompany : async (options: Record<string,any> = {}) => await unions.customerOrder_skusVariantProductCompany(options, {order:apiV2Internal.customerOrder, sku:apiV2Internal.sku}),
	order_skusVariantProductCompany : async (options: Record<string,any> = {}) => await unions.order_skusVariantProductCompany(options, {order:apiV2Internal.orderDetails, sku:apiV2Internal.sku})
}


/**
 * Proxy wrapper for apiV2 that adds graceful error handling
 * 
 * When an API call fails:
 * - Logs error with structured logging
 * - Returns empty result with error information
 * - Prevents page crashes from API failures
 * 
 * Options:
 * - gracefulErrors: false - Disable graceful error handling (throw errors)
 */
export const apiV2 = new Proxy(apiV2Internal, {

	get: (target, prop: string | symbol) => {

		const originalMethod = target[prop as keyof typeof target]

		// If property is not a function, check if it exists at all
		if (typeof originalMethod !== 'function') {

			// If it doesn't exist, return a function that handles the error gracefully
			if (originalMethod === undefined) {

				return async (options: Record<string, any> = {}) => {

					const gracefulErrors	= options.gracefulErrors !== false
					const correlationId		= options?.correlationId
					const errorCode			= 'WEB-SRV-6'
					const errorObj			= errorCodes.object(errorCode)
			
					// Report error (handles both console logging and AppSignal)
					const args = buildArgs(options)

					reportError({
						message			: errorObj.message,
						code			: errorCode,
						correlationId,
						error			: `Method '${String(prop)}' does not exist on apiV2`,
						args			: args ? { ...args, method: String(prop) } : { method: String(prop) }
					})
					
					// If graceful errors disabled, throw
					if (!gracefulErrors) throw new Error(errorObj.message)
					
					// Return graceful error response
					return {
						[options.key || prop]	: options.isMany === false ? null : [],
						error					: [errorObj],
						success					: false,
						status					: 500,
						apiError				: {
							type			: String(prop),
							message			: errorObj.message,
							code			: errorCode,
							status			: 500,
							originalMessage	: `Method '${String(prop)}' does not exist on apiV2`
						}
					}
				}
			}

			// If it exists but is not a function, return it as-is
			return originalMethod
		}

		return async (options: Record<string, any> = {}) => {

			// Check if graceful error handling is disabled
			const gracefulErrors = options.gracefulErrors !== false

			// if no correlationId provided, generate one
			if (!options?.correlationId) options = { ...options, correlationId: generateCorrelationId() }

			try {

				return await originalMethod(options)

			} catch (error: any) {

				const correlationId = options?.correlationId

				// Use error code from helpers.ts if available, otherwise assign based on error type
				let errorCode = error.code || 'WEB-SRV-1' // Default: generic server API error
				
				// Only assign error code if not already set by helpers
				if (!error.code) {

					if (error.status) {

						// HTTP status-based error codes
						if		(error.status >= 500)	errorCode = 'WEB-SRV-3' // Service unavailable (500, 502, 503)
						else if	(error.status === 404)	errorCode = 'WEB-API-4' // Not found
						else if	(error.status === 403)	errorCode = 'WEB-API-3' // Permission denied
					
					} else if (error.message?.includes('fetch') || error.message?.includes('network'))	errorCode = 'WEB-SRV-4' // Connection failed
					else if (error.message?.includes('JSON') || error.message?.includes('parse'))		errorCode = 'WEB-SRV-5' // Data format error

					// Report to AppSignal only if error wasn't already reported by helpers
					// (helpers sets error.code, so if it's missing, this is a new error)
					const proxyErrorMessage	= errorCodes.message(errorCode)
					const args				= buildArgs(options)

					reportError({
						message			: proxyErrorMessage,
						code			: errorCode,
						correlationId,
						error			: error.message,
						status			: error.status?.toString(),
						args			: args ? { ...args, method: String(prop) } : { method: String(prop) }
					})
				}

				// Get user-friendly message from error code
				const userMessage = errorCodes.message(errorCode)

				// If graceful errors disabled, re-throw
				if (!gracefulErrors) throw error

				// Return graceful error response with error code
				const errorInfo = {
					type			: String(prop),
					message			: userMessage,
					code			: errorCode,
					status			: error.status,
					originalMessage	: error.errors?.[0]?.message || error.message
				}

				// Return empty result with error info
				// This allows destructuring to work without crashes
				return {
					[options.key || prop]	: options.isMany === false ? null : [],
					error					: error.errors || [errorInfo],
					success					: false,
					status					: error.status || 500,
					apiError				: errorInfo
				}
			}
		}
	}
})