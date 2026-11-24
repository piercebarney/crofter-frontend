type ApiOptions = Record<string, any>
type ApiResponse = Record<string, any>
type FetchFunction = typeof fetch

import { goto } from '$app/navigation'
import { browser } from '$app/environment'
import { routes } from 'src/lists/routes'
import { reporter, type ErrorReport, buildArgs } from 'src/lib/reporter/module'
import { retryWithBackoff, isRetryableError } from 'src/lib/utils/retry'
import { generateCorrelationId } from 'src/lib/utils/correlationId'
import { errorCodes } from 'src/lists/error-codes'



const reportError	= reporter({type:'error', file:'src/lib/apiV2.ts'})
const reportDebug	= reporter({type:'debug', file:'src/lib/apiV2.ts'})
const url			= '/api/v2'

// Process errors and map error codes to user-friendly messages
const processErrors = (errors: any[]): any[] => {

	if (!errors || !Array.isArray(errors)) return errors

	return errors.map(error => {

		// If error has a code, try to get user-friendly message
		if (error.code) {

			const userMessage = errorCodes.message(error.code)

			// If we have a user-friendly message, use it
			// Otherwise fall back to the backend's title/detail
			if (userMessage && userMessage !== error.code) {

				return {
					...error,
					message: userMessage,
					// Keep original title/detail for debugging
					originalTitle: error.title,
					originalDetail: error.detail
				}
			}
		}

		// No code or no mapping found - return as is
		return error
	})
}

// Request deduplication cache
const inflightRequests = new Map<string, Promise<ApiResponse>>()

function getRequestKey(name: string, options: ApiOptions): string {

	// Create stable hash of request parameters
	// Sort keys to ensure consistent ordering
	// Exclude internal fields that shouldn't affect deduplication
	const sortedOptions = Object.keys(options || {})
		.filter(key => !['_t', 'retry', 'dedupe'].includes(key)) // Exclude cache-busting and control flags
		.sort()
		.reduce((acc, key) => {
			acc[key] = options[key]
			return acc
		}, {} as Record<string, any>)
	
	return `${name}:${JSON.stringify(sortedOptions)}`
}

const parseError = (error:any) => {

	const message:string[] = []

	if (Array.isArray(error)) {

		for (const e of error) {

			if		(e.message)	message.push(e.message)
			else if	(e.detail)	message.push(e.detail)
			else				message.push('Unknown error')
		}
		
	} else {

		if		(error.message)	message.push(error.message)
		else if	(error.detail)	message.push(error.detail)
		else					message.push('Unknown error')
	}	

	return { message:message.join(' | '), error }
}

export const apiV2 = new Proxy({}, {

	get: (_target, name: string | symbol) => {

		return async (options: ApiOptions = {}, doFetch: FetchFunction = fetch): Promise<ApiResponse> => {

			// Request deduplication - only for GET-like operations
			const isMutation = options.set || options.method?.toLowerCase() === 'delete'
			const enableDedup = !isMutation && options.dedupe !== false

			if (enableDedup) {

				const requestKey = getRequestKey(name as string, options)

				// Return existing inflight request if found
				if (inflightRequests.has(requestKey)) {

					return inflightRequests.get(requestKey)!
				}

				// Create new request promise
				const requestPromise = (async () => {

					try {

						return await executeRequest(name, options, doFetch)

					} finally {

						// Clean up after request completes
						inflightRequests.delete(requestKey)
					}
				})()

				inflightRequests.set(requestKey, requestPromise)
				return requestPromise
			}

			// Execute request without deduplication for mutations
			return executeRequest(name, options, doFetch)
		}
	}

}) as Record<string, (options?: ApiOptions, doFetch?: FetchFunction) => Promise<ApiResponse>>


async function executeRequest(
	name: string | symbol,
	options: ApiOptions,
	doFetch: FetchFunction
): Promise<ApiResponse> {

	// Check for impersonation state from cookies and add to options if needed
	if (browser) {

		// Simple cookie getter using modern approach
		const getCookie = (name: string): string | null => {

			const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))

			if (match) {

				try {

					return decodeURIComponent(match[2])

				} catch {

					return match[2]
				}
			}

			return null
		}
		
		const impersonatedUserId = getCookie('ImpersonatedUserId')

		if (impersonatedUserId) {

			options = {
				...options,
				impersonateUserId: impersonatedUserId
			}
		}
	}

	// Generate correlation ID for request tracking
	const correlationId = generateCorrelationId()

	// Make the API call with timeout and retry logic
	const TIMEOUT_MS = 30000 // 30 seconds
	
	// Determine if this request should be retried
	// Only retry GET-like operations, not mutations
	const isMutation = options.set || options.method?.toLowerCase() === 'delete'
	const enableRetry = !isMutation && options.retry !== false

	try {

		const response = await retryWithBackoff(
			async () => {

				const controller = new AbortController()
				const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

				try {

					const res = await doFetch(url, {
						method	: 'POST',
						body	: JSON.stringify({ 
							name, 
							options,
							// Add timestamp to prevent caching
							_t: Date.now() 
						}),
						headers	: { 
							'content-type'		: 'application/json',
							'x-correlation-id'	: correlationId
						},
						// Ensure fetch doesn't use cache
						cache: 'no-store',
						signal: controller.signal
					})

					clearTimeout(timeoutId)

					// Attach status to response for retry logic
					if (!res.ok) {

						const error: any = new Error(`HTTP ${res.status}`)
						error.status = res.status
						error.response = res
						throw error
					}

					return res

				} catch (error) {

					clearTimeout(timeoutId)
					throw error
				}
			},
			{
				maxRetries		: enableRetry ? 3 : 0,
				initialDelay	: 1000,
				shouldRetry		: isRetryableError
			}
		)

		const data = await response.json()

		// Check for errors
		if (response.ok) {

			// Check for API errors
			if (data.error) {

				// Process error codes first
				data.error = processErrors(data.error)

				const { message, error } = parseError(data.error)

				if (message.includes('Sign-in required!')) {

					// Make sure we have a valid route
					const authPathname = routes.authPathname || '/auth'

					if (browser) goto(authPathname)

				} else {

					const args = buildArgs(options)
					const errorReport: ErrorReport = {
						error,
						location	: 'response.ok > data.error',
						message,
						correlationId,
						args		: args ? { ...args, name: name.toString() } : { name: name.toString() }
					}

					// Don't send to AppSignal - already reported server-side
					data.error = reportError(errorReport, { signal: false, prodSignal: false })
				}
			}

			return { ...data }

		// Check for non-2xx status
		} else {

			// Add error codes for specific HTTP status codes if not already present
			if (data.error && Array.isArray(data.error)) {
				data.error = data.error.map((err: any) => {
					// Skip if error already has a code
					if (err.code) return err

					// Map HTTP status to error code
					let errorCode = null
					let errorTitle = err.title

					switch (response.status) {
						case 400:
							errorCode = 'WEB-API-2'
							errorTitle = errorTitle || 'Bad Request'
							break
						case 403:
							errorCode = 'WEB-API-3'
							errorTitle = errorTitle || 'Forbidden'
							break
						case 404:
							errorCode = 'WEB-API-4'
							errorTitle = errorTitle || 'Not Found'
							break
						case 429:
							errorCode = 'WEB-NET-3'
							errorTitle = errorTitle || 'Too Many Requests'
							break
					}

					if (errorCode) {
						return {
							...err,
							code: errorCode,
							title: errorTitle,
							status: response.status.toString()
						}
					}

					return err
				})
			}

			// Process error codes
			if (data.error) {
				data.error = processErrors(data.error)
			}

			const { message, error } = parseError(data.error)
			
			const args = buildArgs(options)
			const errorReport: ErrorReport = {
				error,
				location	: 'response.!ok',
				message,
				correlationId,
				args		: args ? { ...args, name: name.toString() } : { name: name.toString() }
			}

			// Don't send to AppSignal - already reported server-side
			const errorMessage = reportError(errorReport, { signal: false, prodSignal: false })

			throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API Error')
		}

	} catch (error) {

		// Handle abort errors (timeout or manual cancellation)
		if (error instanceof Error && error.name === 'AbortError') {

			// Check if this was a timeout or manual cancellation
			// Currently we only use AbortController for timeouts
			// If you add manual cancellation support, check error.message or add a flag
			const isTimeout = true // Currently all AbortErrors are timeouts

			const errorCode = isTimeout ? 'WEB-NET-2' : 'WEB-API-5'
			const abortError = errorCodes.object(errorCode)

			const processedError = processErrors([abortError])[0]

			const args = buildArgs(options)
			const errorReport: ErrorReport = {
				error: processedError,
				location	: isTimeout ? 'api.timeout' : 'api.cancelled',
				message		: processedError.message || 'Request aborted',
				correlationId,
				args		: args ? { ...args, name: name.toString() } : { name: name.toString() }
			}

			// Send to AppSignal - this is a client-side timeout/cancellation
			const errorMessage = reportError(errorReport)

			throw new Error(typeof errorMessage === 'string' ? errorMessage : processedError.message)
		}

		reportDebug({
			message: 'API request failed',
			correlationId,
			error: error instanceof Error ? error.message : String(error),
			args: { name: name.toString() }
		})

		// Determine error code based on error type
		let errorCode = 'WEB-API-1' // Generic API error
		const errorDetail = error instanceof Error ? error.message : String(error)

		// Check if error already has a code (e.g., from circuit breaker)
		if (error && typeof error === 'object' && 'code' in error && error.code) {
			errorCode = error.code as string
		} else if (error instanceof TypeError && errorDetail.includes('fetch')) {
			errorCode = 'WEB-NET-4' // Fetch failed, DNS error, or CORS issue
		} else if (errorDetail.includes('NetworkError') || errorDetail.includes('network')) {
			errorCode = 'WEB-NET-1' // Network offline or connection lost
		}

		// Create error with code for user-friendly message
		const apiError = errorCodes.object(errorCode)

		const processedError = processErrors([apiError])[0]

		const { message, error:catchError } = parseError(processedError)

		const args = buildArgs(options)
		const errorReport: ErrorReport = {
			error		: catchError,
			location	: 'api.catch',
			message,
			correlationId,
			args		: args ? { ...args, name: name.toString() } : { name: name.toString() }
		}

		// Send to AppSignal - this is a client-side error (network, etc.)
		const errorMessage = reportError(errorReport)

		throw new Error(typeof errorMessage === 'string' ? errorMessage : processedError.message || 'API Error')
	}
}
