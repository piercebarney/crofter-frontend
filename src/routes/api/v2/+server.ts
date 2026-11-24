import type { RequestHandler } from './$types'

import { json } from '@sveltejs/kit'
import { apiV2 } from 'src/lib/server/apiV2/api'
import { getCorrelationId } from 'src/lib/utils/correlationId'
import { errorCodes } from 'src/lists/error-codes'
import { reporter } from 'src/lib/reporter/module'

const reportError = reporter({ type: 'error', file: 'src/routes/api/v2/+server.ts' })


/**
 * Add no-cache headers to prevent API responses from being cached
 * in web browsers, PWAs, and Capacitor native apps
 */
function addNoCacheHeaders(response: Response, correlationId?: string): Response {
	
	// Prevent all caching
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
	response.headers.set('Pragma', 'no-cache')
	response.headers.set('Expires', '0')
	response.headers.set('Surrogate-Control', 'no-store')
	
	// Add correlation ID for request tracking
	if (correlationId) response.headers.set('x-correlation-id', correlationId)
	
	return response
}


export const POST: RequestHandler = async ({ request, cookies }) => {
	
	// Extract correlation ID from request headers first
	const correlationId = getCorrelationId(request.headers) || undefined
	
	try {
		// Parse request body with error handling
		let name: string,
			options: Record<string, any> = {}
		
		try {

			const body = await request.json() as { name: string; options?: Record<string, any> }

			name 	= body.name
			options	= body.options || {}

		} catch (parseError: any) {

			const errorCode	= 'WEB-SRV-5'
			const errorObj	= errorCodes.object(errorCode)
			
			reportError({
				message			: errorObj.message,
				code			: errorCode,
				correlationId,
				error			: parseError.message
			})
			
			return addNoCacheHeaders(json({
				success			: false,
				error			: [errorObj],
				status			: 400
			}), correlationId || undefined)
		}
		
		// Validate API endpoint exists
		if (!Object.hasOwn(apiV2, name)) {

			const errorCode	= 'WEB-SRV-6'
			const errorObj	= errorCodes.object(errorCode)
			
			reportError({
				message			: errorObj.message,
				code			: errorCode,
				correlationId,
				error			: `API endpoint '${name}' does not exist`,
				args			: { endpoint: name }
			})
			
			return addNoCacheHeaders(json({
				success			: false,
				error			: [errorObj],
				status			: 404
			}), correlationId || undefined)
		}
		
		// Add authentication tokens
		const token			= cookies.get('AuthorizationToken')
		const guestToken	= cookies.get('GuestToken')
		
		const apiOptions = {
			...options,
			...(token && { token }),
			...(guestToken && !token && { guestToken }),
			...(correlationId && { correlationId }),
			errorReporting : false
		}
		
		// Execute API call (apiV2 proxy handles errors gracefully)
		const result = await apiV2[name](apiOptions)

		return addNoCacheHeaders(json(result), correlationId || undefined)
		
	} catch (unexpectedError: any) {

		// Catch any unexpected errors at endpoint level
		const errorCode	= 'WEB-SRV-1'
		const errorObj	= errorCodes.object(errorCode)
		
		reportError({
			message			: errorObj.message,
			code			: errorCode,
			correlationId,
			error			: unexpectedError.message || String(unexpectedError)
		})
		
		return addNoCacheHeaders(json({
			success			: false,
			error			: [errorObj],
			status			: 500
		}), correlationId || undefined)
	}
}