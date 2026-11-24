import { PUBLIC_API_URL } from '$env/static/public'
import { snakeCase } from 'src/lib/helpers'
import { camelToSnakeCase, snakeToCamelCase } from 'src/lib/utils/caseConversion'
import { models } from 'src/lib/server/apiV2/models'
import { retryWithBackoff, isRetryableError } from 'src/lib/utils/retry'
import { apiCircuitBreaker } from 'src/lib/utils/circuitBreaker'
import { errorCodes } from 'src/lists/error-codes'
import { reporter, buildArgs } from 'src/lib/reporter/module'


const baseUrl = `${PUBLIC_API_URL}/api/json`
const reportError = reporter({ type: 'error', file: 'src/lib/server/apiV2/helpers.ts' })
const reportDebug = reporter({ type: 'debug', file: 'src/lib/server/apiV2/helpers.ts' })

// Process errors from backend and map error codes to user-friendly messages
const _processErrors = (errors: any[]): any[] => {

	if (!errors || !Array.isArray(errors)) return errors

	return errors.map(error => {

		let errorCode = 'WEB-SRV-9'

		if (error.code && error.code != 'invalid') errorCode = error.code
			
		const userMessage = errorCodes.message(errorCode)

		return {
			...error,
			code: errorCode,
			message: userMessage
		}
	})
}

// build url for fetch
const _buildUrl = (name:string, options:Record<string,any>) => {

	name = camelToSnakeCase(name)

	const isMany	= options.isMany
	const fieldName	= camelToSnakeCase(options.fieldName)
	const id		= options.id ?? null
	const path		= options.path ?? null
	const filter	= options.filter ?? null
	const limit		= options.limit ?? null
	const page		= options.page ?? null
	const join		= options.join ?? null
	const get		= options.get ?? null
	const sort		= options.sort ?? null
	const query		= []

	// Ensure proper slash between baseUrl and endpoint name
	const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
	let url = `${base}/${name}`

	if (filter) {

		const filterKeys = Object.keys(filter)

		// Add filter to query
		for (const key of filterKeys) {

			if (typeof filter[key] == 'object') {

				for (const subKey of Object.keys(filter[key])) query.push(`filter[${snakeCase(key)}][${snakeCase(subKey)}]=${encodeURIComponent(filter[key][subKey])}`)

			} else query.push(`filter[${snakeCase(key)}]=${encodeURIComponent(filter[key])}`)
		}
	}

	if (isMany) {

		if (path) url += `/${camelToSnakeCase(path)}`

		// If limit is provided, append it to the query
		if (limit) query.push(`page[limit]=${encodeURIComponent(limit)}`)

		if (page) query.push(`page[offset]=${encodeURIComponent(page)}`)

	} else {

		// If id is provided, append it to the url
		if (id) url += `/${id}`

		if (path) url += `/${camelToSnakeCase(path)}`
	}

	if (join) {

		// Add include to query
		query.push(`include=${encodeURIComponent(camelToSnakeCase(join.replaceAll(' ', '')))}`)
	}

	// If get is provided, append it to the query
	if (get) {

		if		(get == 'none') query.push(`fields[${fieldName}]=id`)
		else if	(typeof get == 'string') query.push(`fields[${fieldName}]=${encodeURIComponent(camelToSnakeCase(get))}`)
		else if	(typeof get == 'object') {

			for (const key of Object.keys(get)) query.push(`fields[${camelToSnakeCase(key)}]=${encodeURIComponent(camelToSnakeCase(get[key]))}`)
		}
	}

	// If sort is provided, append it to the query
	if (sort) query.push(`sort=${encodeURIComponent(camelToSnakeCase(sort))}`)

	return url + (query.length ? `?${query.join('&')}` : '')
}

// recursive function to convert property names to snake_case while preserving object structure and no keys on arrays
const _processSetData = (set:any) : any => {

	if (set === null || set === undefined) return set

	if (Array.isArray(set)) {

		return set.map((item:any) => _processSetData(item))
	
	} else if (typeof set == 'object') {

		const processedSetData: any = {}

		for (const key of Object.keys(set)) processedSetData[snakeCase(key)] = _processSetData(set[key])

		return processedSetData
	}

	return set
}

// build options for fetch
const _buildOptions = (options:Record<string,any>) => {

	const method			= options.method ?? null
	const token				= options.token ?? null
	const guestToken		= options.guestToken ?? null
	const impersonateUserId	= options.impersonateUserId ?? null
	const correlationId		= options.correlationId ?? null
	const set				= options.set ? _processSetData(options.set) : null
	const setProperty		= options.setProperty ? camelToSnakeCase(options.setProperty) : 'attributes'
	const id				= options.id ?? null
	const headers			= {
		'accept'		: 'application/vnd.api+json',
		'Content-Type'	: 'application/vnd.api+json'
	}

	const props: Record<string,any>	= {method:'GET', headers}

	// Add headers
	if		(token)			props.headers['Authorization'] = `Bearer ${token}`
	else if	(guestToken)	props.headers['guest-session'] = guestToken
	
	// Add impersonation header if present
	if (impersonateUserId) props.headers['x-impersonate-user-id'] = impersonateUserId
	
	// Add correlation ID for request tracking
	if (correlationId) props.headers['x-correlation-id'] = correlationId

	// Add body
	if (set) {

		// If id is provided, use patch, otherwise use post
		props.method = method?.toUpperCase() ?? (id ? 'PATCH' : 'POST')

		let body: Record<string,any>

		if (setProperty == 'none') {

			body = { data:set }

		} else {

			body = { data:{ [setProperty]:{} } }

			body.data[setProperty] = set
		}

		if (id) body.data.id = id

		props.body = body
	
	} else if (id && method?.toLowerCase() == 'patch') {

		props.method = method.toUpperCase()
		
		props.body = setProperty == 'none' ? { data:set } : { data:{ [setProperty]:{} } }
	
	} else if (id && method?.toLowerCase() == 'delete') {
		
		props.method = method.toUpperCase()

	} else if (method) {

		props.method = method.toUpperCase()
	}

	// Stringify body
	if (Object.hasOwn(props, 'body')) props.body = JSON.stringify(props.body)

	return props
}

// process attributes for response
const _processAttributes = (id:string, attributes:any, attributeKeys:string[]) => {

	if (!attributes) return {}

	const items: any = {id}

	for (const key of attributeKeys) items[snakeToCamelCase(key)] = _deepConvertKeys(attributes[key])

	return items
}

// process relationships for response
const _processRelationships = (id:string, relationships:any, relationshipKeys:any, included:any, i:number) => {

	if (!included) return {}

	const items: any = {id}

	for (const keys of relationshipKeys) {

		if (Object.hasOwn(relationships[keys.key], 'data')) {

			const rData = relationships[keys.key].data

			if (Array.isArray(rData)) {

				items[keys.camelKey] = []

				for (const rItem of rData) {
			
					const id = rItem.id

					items[keys.camelKey].push(_processData(included.find((i:any) => i.id == id), included, i++))
				}
			
			} else if (rData) {

				const id = rData.id

				items[keys.camelKey] = _processData(included.find((i:any) => i.id == id), included, i++)
			}
		}
	}

	return items
}

/**
 * Recursively converts snake_case keys to camelCase for nested objects/arrays
 * Handles plain objects, arrays, and primitive values
 */
const _deepConvertKeys = (value: any): any => {

	// Handle null/undefined
	if (value === null || value === undefined) return value

	// Handle arrays - recursively process each element
	if (Array.isArray(value)) return value.map(item => _deepConvertKeys(item))

	// Handle objects - recursively process each property
	if (typeof value === 'object') {

		const converted: any = {}
		
		for (const [key, val] of Object.entries(value)) {

			const camelKey = snakeToCamelCase(key)

			converted[camelKey] = _deepConvertKeys(val)
		}
		
		return converted
	}

	// Return primitives as-is (string, number, boolean)
	return value
}

/**
 * Main data processor - handles both JSON:API format and plain objects
 * - JSON:API: Flattens attributes/relationships, resolves included resources
 * - Plain objects: Deep converts snake_case to camelCase recursively
 */
const _processData = (data:any, included:any, i:number = 0) => {

	// Handle empty data
	if (!data || (Array.isArray(data) && data.length === 0)) return data

	const isMany		= Array.isArray(data)
	const sample		= isMany ? data[0] : data
	const hasAttributes = sample?.attributes !== undefined

	// JSON:API format detected - use structured processing
	if (hasAttributes) {

		const attributeKeys		= Object.keys(sample.attributes || {})
		const relationshipKeys	= sample.relationships 
			? Object.keys(sample.relationships).map(key => ({
				key,
				camelKey: snakeToCamelCase(key)
			}))
			: []

		// Process array of JSON:API resources
		if (isMany) {

			return data.map((item:any) => {
				const attributes	= _processAttributes(item.id, item.attributes, attributeKeys)
				const relationships = _processRelationships(item.id, item.relationships, relationshipKeys, included, i)

				return {...attributes, ...relationships}
			})
		}

		// Process single JSON:API resource
		const attributes	= _processAttributes(data.id, data.attributes, attributeKeys)
		const relationships	= _processRelationships(data.id, data.relationships, relationshipKeys, included, i)

		return {...attributes, ...relationships}
	}

	// Plain object format - use deep conversion
	return _deepConvertKeys(data)
}

// fetch api
export const api = async (name:string, options:Record<string,any>) => {

	let model = options?.model ?? null

	if (model && Object.hasOwn(models, name)) {

		if	(models[name][model])	model = models[name][model]
		else						model = null
		
	} else model = null

	if (model) options = model.options(options)

	// const modelName	= options?.model ?? null
	const url	= _buildUrl(name, options)
	const props	= _buildOptions(options)
	
	// Determine if this request should be retried
	// Only retry GET-like operations, not mutations
	const isMutation	= props.method !== 'GET'
	const enableRetry	= !isMutation
	const correlationId	= options?.correlationId
	const debug			= options.debug || false

	let status: number		= 0,
		response: Response

	try {

		// Wrap fetch with circuit breaker for resilience
		response = await apiCircuitBreaker.execute(

			() => retryWithBackoff(

				async () => {

					const TIMEOUT_MS	= 30000 // 30 seconds
					const controller	= new AbortController()
					const timeoutId		= setTimeout(() => controller.abort(), TIMEOUT_MS)

					try {

						const res = await fetch(url, { ...props, signal: controller.signal })

						clearTimeout(timeoutId)

						// Check if response should trigger retry
						// Throw error for retryable statuses (5xx, 429) so retry logic can handle them
						// Return response for non-retryable errors (4xx) so they can be processed with error codes
						if (!res.ok) {

							const isRetryable = res.status >= 500 || res.status === 429 || res.status === 408
							
							if (isRetryable) {

								const error: any = new Error(`HTTP ${res.status}`)

								error.status	= res.status
								error.response	= res

								throw error
							}
						}

						return res

					} catch (fetchError) {

						clearTimeout(timeoutId)

						// Handle timeout errors
						if (fetchError instanceof Error && fetchError.name === 'AbortError') {

							const timeoutError: any = new Error('Request timeout')
							
							timeoutError.name	= 'AbortError'
							timeoutError.status	= 408

							throw timeoutError
						}

						throw fetchError
					}
				},
				{
					maxRetries		: enableRetry ? 3 : 0,
					initialDelay	: 1000,
					shouldRetry		: isRetryableError
				}
			),
			correlationId
		)

		status = response.status

	} catch (fetchError: any) {

		// Handle timeout errors with proper response format
		if (fetchError instanceof Error && fetchError.name === 'AbortError') {

			const errorCode		= 'WEB-SRV-7'
			const errorMessage	= errorCodes.message(errorCode)
		
			// Report error (handles both console logging and AppSignal)
			reportError({
				correlationId,
				url,
				code			: errorCode,
				message			: errorMessage,
				error			: fetchError.message,
				args			: buildArgs(options),
				props
			})

			// Throw structured error for proxy to handle
			const timeoutError: any = new Error(errorMessage)

			timeoutError.code			= errorCode
			timeoutError.correlationId	= correlationId

			throw timeoutError
		}

		// Handle other fetch errors (network failures, DNS, etc.)
		const errorCode		= 'WEB-SRV-4'
		const errorMessage	= errorCodes.message(errorCode)
	
		// Report error (handles both console logging and AppSignal)
		reportError({
			correlationId,
			url,
			code			: errorCode,
			message			: errorMessage,
			error			: fetchError.message || String(fetchError),
			args			: buildArgs(options),
			props
		})

		// Throw structured error
		const connectionError: any = new Error(errorMessage)

		connectionError.code			= errorCode
		connectionError.status			= 0
		connectionError.correlationId	= correlationId
		connectionError.originalError	= fetchError

		throw connectionError
	}

	let json, rawData, included, error, data
	
	// Check if response is JSON before parsing
	const contentType = response.headers.get('content-type') || ''

	// console.log('api response', {name, options, modelName, url, props, status, contentType})
	
	if (contentType.includes('application/json') || contentType.includes('application/vnd.api+json')) {

		try {

			json		= await response.json()
			rawData		= json?.data ? json.data : (typeof json === 'object' && json !== null) ? json : null
			included	= json?.included ?? null
			error		= json?.errors ? _processErrors(json.errors) : null
			data		= !error ? (model ? model.data(_processData(rawData, included)) : _processData(rawData, included)) : null

		} catch (parseError: any) {

			// JSON parsing failed
			const errorCode		= 'WEB-SRV-5'
			const errorObj		= errorCodes.object(errorCode)
		
			// Report error with full details for AppSignal
			reportError({
				message			: errorObj.message,
				code			: errorCode,
				correlationId,
				url,
				status			: status.toString(),
				error			: parseError.message,
				meta			: { 
					contentType, 
					parseError		: parseError.message,
					stack			: parseError.stack 
				},
				args			: buildArgs(options),
				props
			})

			// Return clean error to frontend
			error		= [errorObj]
			rawData		= null
			included	= null
			data		= null
		}

	} else {

		// Non-JSON response (HTML error page, etc.)
		const responseText = await response.text()
		
		// Try to extract meaningful error from HTML
		let errorTitle	= 'Server Error',
			errorDetail	= `HTTP ${status}`
		
		// Parse common HTML error patterns
		const titleMatch = responseText.match(/<title>(.*?)<\/title>/i)

		if (titleMatch) errorTitle = titleMatch[1].trim()
		
		const h1Match = responseText.match(/<h1[^>]*>(.*?)<\/h1>/i)

		if (h1Match) errorDetail = h1Match[1].trim()
		
		// Assign error code based on HTTP status
		let errorCode = 'WEB-SRV-8' // Default: Invalid response structure

		switch (status) {

			case 400:
				errorCode = 'WEB-API-2'
				break

			case 403:
				errorCode = 'WEB-API-3'
				break

			case 404:
				errorCode = 'WEB-API-4'
				break

			case 429:
				errorCode = 'WEB-NET-3'
				break

			case 500:
			case 502:
			case 503:
				errorCode = 'WEB-SRV-3'
				break
		}
		
		// Get error object from error codes
		const errorObj = errorCodes.object(errorCode)
		
		// Report error with full details for AppSignal
		reportError({
			message				: errorObj.message,
			code				: errorCode,
			correlationId,
			url,
			status				: status.toString(),
			error				: errorDetail,
			meta				: {
				contentType,
				originalResponse	: responseText.substring(0, 300),
				htmlTitle			: titleMatch ? errorTitle : null,
				htmlDetail			: h1Match ? errorDetail : null
			},
			args				: buildArgs(options),
			props
		})
		
		// Return clean error to frontend (use HTML-extracted title/detail if available)
		if (titleMatch || h1Match) {

			error = [{
				code	: errorCode,
				title	: errorTitle,
				detail	: errorDetail,
				message	: errorObj.message
			}]

		// Use error-codes.ts values for non-HTML responses
		} else error = [errorObj]
		
		// Process error codes to add user-friendly messages
		if (error) error = _processErrors(error)
		
		rawData		= null
		included	= null
		data		= null
	}

	const result: Record<string,any> = {data:null, error:null, success:false, status}

	if (error) {

		// console.log('error > ', error)

		result.error = error
		
		// Get error code from first error (already assigned in error handling above)
		const errorCode = error[0]?.code
		
		// Get user-friendly message from first error (already assigned in error handling above)
		const errorMessage = error[0]?.message
		
		// Report error (handles both console logging and AppSignal)
		reportError({
			message			: errorMessage,
			code			: errorCode,
			correlationId,
			url,
			status			: status.toString(),
			error			: error[0]?.detail || error[0]?.title || errorMessage,
			args			: buildArgs(options),
			props
		})
		
		// Throw structured error for proxy to handle
		const apiError: any = new Error(errorMessage)

		apiError.code			= errorCode
		apiError.status			= status
		apiError.errors			= error
		apiError.correlationId	= correlationId
		
		throw apiError
		
	} else if ([200, 201].includes(status)) {

		result.success		= true,
		result.data			= data,
		result[options.key] = result.data
		
		// Log successful request (debug level)
		if (debug) reportDebug({
			message: 'API request successful',
			correlationId,
			url,
			status: status.toString(),
			args: buildArgs(options),
			props,
			result
		})
	}
	
	return result
}