import type { DocumentNode } from 'graphql'
import type { ApolloClient, NormalizedCacheObject, OperationVariables } from '@apollo/client/core/index'

import { gql } from '@apollo/client/core/index'
import { reporter } from 'src/lib/reporter/module'

// types
type Values = OperationVariables|undefined
type Variables = Record<string,string|any>
type QueryCache = {
	keys:	string[]|null
	query:	string
}

export type GQLBody = {
	arguments?:	string
	fields:		string
	variables?:	Variables
}

const file			= '/src/lib/server/clientHelpers.ts'
const reportError	= reporter({ type: 'error', file })
const reportDebug	= reporter({ type: 'debug', file })
const ignore		= ['input', 'getBy', '_sub']

const queryCache: Record<string,QueryCache> = {}

// keep and process the values that have matching variable names
const processVals = (variables:Variables|undefined, values:Values) : Values  => {

	// console.log('processVals', variables, variables?.input?.fulfillment, values)

	if (!variables || !values || Object.keys(values).length === 0) return undefined

	const vals: Record<string,any> = {}

	let i = 0

	const recur = (vars:Variables, parent:string|null = null, pathParent:string|null = null, keyParent:string|null = null, array:string|null = null, index:number|null = null) => {

		i++

		if (i > 32) {

			reportError({
				location	: 'processVals',
				message		: 'Infinite loop detected.',
				args		: { variables, values }
			})
			
			return false
		}

		// console.log({vars, array})

		for (const v in vars) { // cycle through the expected variables for a graph

			const vParent	= parent ? `${parent}_${v}` : v
			const path		= pathParent ? `${pathParent}.${v}` : ignore.includes(v) ? null : v // construct the path for nested values
			const keyBase	= keyParent ? `${keyParent}_${v}` : v // construct the base for the key
			const type		= typeof vars[v] == 'string' ? vars[v] : null // the type of value needed for this variable (v)
			const child		= type ? null : vars[v] // the set of child variables for this varible (v)

			let key: string|null = index != null && index > -1 ? `${keyBase}_${index}` : keyBase  // construct the key for the value that correlates to this variable (v)

			// console.log({v, type, child, key})

			if (type) {

				if		(Object.hasOwn(values, vParent))	key = vParent
				else if	(!Object.hasOwn(values, key))		key = null

				// console.log({v, vParent, key})

				if (key) {

					let val = values[key]

					// console.log({v, key, val})

					// process the value as needed
					if		(type.includes('Boolean'))	val = val === 'true' || val === true ? true : val === null ? null : false
					else if (type.includes('Int'))		val = val ? parseInt(val, 10) : 0
					else if (type.includes('Decimal'))	val = val ? Number(parseFloat(val).toFixed(2)) : 0

					if (array && index != null) { // if value belongs to an array

						if (index == -1) { // for simple array data passed as string delimited by a comma

							const split = val.split(',')
	
							split.forEach((s:string, i:number) => {
	
								if (typeof vals[array][i] == 'undefined') vals[array][i] = {}
	
								vals[array][i][v] = s
							})

						} else if (path) {

							const keys = path.split('.')
							const lastKey = keys.pop() // Get the last key to set the value
						  
							// Traverse the object until the second-to-last key
							const target = keys.reduce((acc, key, index) => {

								const nextKey				= keys[index + 1] ? keys[index + 1] : lastKey
								const isNextKeyArrayIndex	= !isNaN(Number(nextKey))
								const currentIndex			= Number(key)

								if (!isNaN(currentIndex)) {

									// If it's an array index, make sure the array exists
									if (!acc[currentIndex]) acc[currentIndex] = isNextKeyArrayIndex ? [] : {}

									return acc[currentIndex]

								} else {

									// If it's an object key, make sure the object exists
									if (!acc[key]) acc[key] = isNextKeyArrayIndex ? [] : {}

									return acc[key]
								}

							}, vals)
						  
							// Assign the value to the final key
							if (lastKey) target[lastKey] = val
						}
					
					} else vals[key] = val
				}
			
			} else if (Array.isArray(child)) {

				// console.log('array found')
				
				vals[key] = []

				let i		= -1,
					next	= true

				do {
	
					recur(child[1], v, i > -1 ? `${path}.${i}`: path, keyBase, v, i)

					const length = vals[key].length

					// if (i == -1 && length === 1 || i === length) next = false
					if (i == -1 && length > 0 || i === length) next = false

					// console.log({length, i, next})
				
					i++

				} while (next)

			
			} else recur(child, ignore.includes(v) ? null : v, ignore.includes(v) ? null : path, ignore.includes(v) ? null : keyBase, array, index)
		}
	}

	recur(variables)

	return vals
}

// variable decloration for found matching values
const processVars = (name:string, variables:Variables|undefined, values:Values) : string => {

	// console.log('processVars')

	if (!variables || !values || Object.keys(values).length === 0) return ''

	const result: string[] = []

	let i = 0

	const recur = (vars:Variables, parent:string|null = null, keyParent:string|null = null) => {
	
		i++

		if (i > 32) {

			reportError({
				location	: 'processVars',
				message		: 'Infinite loop detected.',
				args		: { name, variables, values }
			})
			
			return false
		}

		for (const v in vars) { // cycle through the expected variables for a graph

			const vParent	= parent ? `${parent}_${v}` : v
			const keyBase	= keyParent ? `${keyParent}_${v}` : v // construct the base for the key
			const type		= typeof vars[v] == 'string' ? vars[v] : Array.isArray(vars[v]) ? `array:${vars[v][0]}` : null // the type of value needed for this variable (v)
			const child		= type ? null : vars[v] // the set of child variables for this varible (v)

			let key: string|null = keyBase

			if (type) {

				if		(Object.hasOwn(values, vParent))	key = vParent
				else if	(!Object.hasOwn(values, key))		key = null

				if (key) {

					if (type.includes('array')) {

						const dataType	= type.split(':')[1]
						const bang		= type.includes('!') ? '!' : ''

						result.push(`$${key}:[${dataType.replace('!', '')}]${bang}`)

					} else result.push(`$${key}:${type}`)
				}
			
			} else recur(child, ignore.includes(v) ? null : v, ignore.includes(v) ? null : keyBase)
		}
	}

	recur(variables)

	if (result.length === 0) return ''

	if (name.includes('/')) name = name.split('/')[0]

	return ` ${name.toUpperCase()}(${result.join(',')})`
}

// place variables
const processArgs = (args:string|undefined, variables:Variables|undefined, values:Values) : {primary:string, sub:Record<string,string>} => {

	// console.log('processArgs')

	// console.log({args, variables, values})

	let sub: Record<string,any> = {}

	if (args) return {primary:`(${args})`, sub}

	if (variables) {

		let i = 0

		const recur = (vars:Variables, parent:string|null = null, keyParent:string|null = null) : string[] => {

			i++

			if (i > 32) {

				reportError({
					location	: 'processArgs',
					message		: 'Infinite loop detected.',
					args		: { args, variables, values }
				})
				
				return []
			}

			const result: string[] = []

			for (let v in vars) { // cycle through the expected variables for a graph
	
				const vParent	= parent ? `${parent}_${v}` : v
				const keyBase	= keyParent ? `${keyParent}_${v}` : v // construct the base for the key
				const child		= typeof vars[v] == 'string' || Array.isArray(vars[v]) ? null : vars[v] // the set of child variables for this varible (v)
	
				let key: string|null = keyBase

				if (!child) {

					if (values) {

						if		(Object.hasOwn(values, vParent))	key = vParent
						else if	(!Object.hasOwn(values, key))		key = null
		
						if (key) result.push(`${v}:$${key}`)
					}
				
				} else {
					
					const r = recur(child, ignore.includes(v) ? null : v, ignore.includes(v) ? null : keyBase)
				
					if (r.length > 0 || v.includes('!')) {

						if (v.includes('!')) v = v.replace('!', '')

						result.push(`${v}:{${r.join(',')}}`)
					}
				}
			}
	
			return result
		}

		if (Object.hasOwn(variables, '_sub')) {
			
			sub = variables._sub

			delete variables._sub
		}

		const subResult: Record<string,string> = {}

		const primaryResult = recur(variables)

		if (Object.keys(sub).length > 0) {

			for (const key in sub) {

				const sResult = recur(sub[key])

				if (sResult.length > 0) subResult[key] = `(${sResult.join(',')})`
			}
		}

		if (primaryResult.length === 0) return {primary:'', sub:subResult}

		return {primary:`(${primaryResult.join(',')})`, sub:subResult}
	}

	return {primary:'', sub}
}

// proces fields string
const processFields = (fields:string) : string => fields.trim().replace(/\s+{\s+/g, '{').replace(/\s+}\s+/g, '},').replace(/\s+/g, ',').replace(/,}/g, '}').replace(/,\)/g, ')')

const cacheCheck = (name:string, values:Values, cacheQuery:boolean) => {

	if (cacheQuery && Object.hasOwn(queryCache, name) && queryCache[name]) {

		if (values) {

			if (queryCache[name].keys !== Object.keys(values)) return true

			return false
		}

		return true
	}

	return false
}

const processBody = (type:string, name:string, body:GQLBody|string, values:Values, cacheQuery:boolean) => {

	// console.log('processBody')

	cacheQuery = false
	
	const cacheExists = cacheCheck(name, values, cacheQuery)

	const result: {gql:DocumentNode|null, query:string, values:Values} = {
		gql		: null,
		query	: '',
		values	: undefined
	}

	if (cacheQuery && cacheExists) {

		result.query = queryCache[name].query
	
	} else {

		if (typeof body === 'string') result.query = body
		else {

			result.values = processVals(body.variables, values)

			const vars	= processVars(name, body.variables, result.values)
			const args	= processArgs(body.arguments, body.variables, result.values)
			
			let	fields	= processFields(body.fields)

			if (Object.keys(args.sub).length > 0) {

				for (const key in args.sub) {

					fields = fields.replace(`${key}{`, `${key}${args.sub[key]}{`)
				}
			}

			if (name.includes('/')) {

				const names = name.split('/')

				const recur = (rNames:string[]) : string => {

					if (rNames.length > 0) {

						const rName = rNames.shift()

						if (rNames.length === 0) return `${rName}${args.primary}{${recur(rNames)}}`

						return `${rName}{${recur(rNames)}}`
					
					} else return fields
				}

				result.query = `${type}${vars}{${recur(names)}}`

			} else result.query = `${type}${vars}{${name}${args.primary}{${fields}}}`
		}
	}

	try {

		result.gql = gql`${result.query}`
	
	} catch (error:any) {
		
		let message: any
		
		if		(typeof error == 'string')			message = error
		else if	(Object.hasOwn(error, 'message'))	message = error.message
		else										message = 'An unknown error occurred.'

		reportError({
			location	: 'processBody',
			message,
			args		: { type, name, body, values: result.values },
			error
		})
	}

	if (cacheQuery && !cacheExists && result.gql) queryCache[name] = {
		keys	: values ? Object.keys(values) : null,
		query	: result.query,
	}

	return result
}

const parseOptions = (options:Record<string,any>) => {

	const context: { headers:Record<string,any> } = { headers:{} }

	let variables	= null,
		field		= null,
		key			= null,
		debug		= false,
		cacheQuery	= true,
		index		= null

	if	(Object.hasOwn(options, 'fetchPolicy'))	{

		if (options.fetchPolicy == 'cache') delete options.fetchPolicy
		
	} else options.fetchPolicy = 'no-cache'

	if (Object.hasOwn(options, 'guestToken'))	{ context.headers['guest-session'] = options.guestToken; delete options.guestToken	}
	if (Object.hasOwn(options, 'token'))		{ context.headers.authorization = `Bearer ${options.token}`; delete options.token	}
	if (Object.hasOwn(options, 'impersonateUserId'))	{ 
		context.headers['x-impersonate-user-id'] = options.impersonateUserId; 
		delete options.impersonateUserId	
	}
	if (Object.hasOwn(options, 'variables'))	{ variables = options.variables; delete options.variables }
	if (Object.hasOwn(options, 'field'))		{ field = options.field; delete options.field }
	if (Object.hasOwn(options, 'key'))			{ key = options.key; delete options.key }
	if (Object.hasOwn(options, 'debug'))		{ debug = options.debug }
	if (Object.hasOwn(options, 'cacheQuery'))	{ cacheQuery = options.cacheQuery; delete options.cacheQuery }
	if (Object.hasOwn(options, 'index'))		{ index = options.index; delete options.index }

	return { context, variables, field, key, debug, cacheQuery, index }
}

const formatErrorDetails = (obj: any, prefix: string = ''): string[] => {

	const details: string[] = []

	if (Array.isArray(obj)) {

		obj.forEach((item) => {

			if (typeof item === 'object' && item !== null) {

				for (const [key, value] of Object.entries(item)) {

					const newPrefix = prefix ? `${prefix}: ${key}` : key

					if (Array.isArray(value)) {

						details.push(`${newPrefix}: ${value.join(', ')}`)

					} else {

						const subDetails = formatErrorDetails(value, newPrefix)

						details.push(...subDetails)
					}
				}

			} else details.push(item)
		})

		return details
		
	} else if (typeof obj === 'object' && obj !== null) {

		for (const [key, value] of Object.entries(obj)) {

			const newPrefix = prefix ? `${prefix}: ${key}` : key

			if (Array.isArray(value)) {

				if (typeof value[0] === 'object') {

					const subDetails = formatErrorDetails(value, newPrefix)

					details.push(...subDetails)

				} else details.push(`${newPrefix}: ${value.join(', ')}`)
			} else if (typeof value === 'object' && value !== null) {

				const subDetails = formatErrorDetails(value, newPrefix)

				details.push(...subDetails)

			} else details.push(`${newPrefix}: ${value}`)
		}

		return details
	}

	return [String(obj)]
}

const formatError = (graphQLErrors: Record<string,any>[]) : string => {

	let result = ''

	for (const error of graphQLErrors) {

		result += error.message

		if (typeof error.details === 'string') result += `: ${error.details}`
		else if (error.details) {

			const details = formatErrorDetails(error.details)

			if (details.length > 0) result += ` (${details.join('; ')})`

		} else if (typeof error.error === 'string') result += `: ${error.error}`
	}

	return result
}

// Helper function for exponential backoff delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to determine if an error is retryable
const isRetryableError = (error: any): boolean => {

	// Check for 503 Service Unavailable
	if (error?.networkError?.statusCode === 503) return true
	
	// Check for network errors that might be temporary
	if (error?.networkError && !error?.graphQLErrors) return true
	
	// Check for specific error messages that indicate temporary issues
	if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network request failed') || error?.message?.includes('Response not successful: Received status code 503')) return true
	
	return false
}

export const build = async (client:ApolloClient<NormalizedCacheObject>, type:string, name:string, body:GQLBody|string, options:Record<string,any> = {}) => {

	// console.log('build:', name)

	const maxRetries = 1
	
	const { context, variables, field, key, debug, cacheQuery, index } = parseOptions(options)

	const { gql, query, values } = processBody(type, name, body, variables, cacheQuery)

	let result:		any		= null,
		successful:	boolean	= false

	if (gql) {
		
		let retryCount:	number = 3
		
		// Try the initial request plus up to maxRetries retries
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			
			// Skip remaining attempts if we've already succeeded
			if (successful) break
			
			try {
				
				result = type == 'mutation' ? (await client.mutate({ mutation:gql, variables:values, context, ...options })).data : (await client.query({ query:gql, variables:values, context, ...options })).data

				const oneField = (typeof body === 'object' && body.fields.trim().split(/\s+/g).length === 1) ? body.fields : null

				const nameArray = name.split('/')

				nameArray.forEach(n => {result = result[n]; name = n})

				if (index !== null) result = result[index]

				// Determine which property name and value to use
				const propName	= field || oneField || name
				const propValue	= field ? result[field] : (oneField ? result[oneField] : result)

				// Use the key if provided, otherwise use the determined property name
				result = { [key || propName]: propValue } as Record<string, any>
				
				// Mark as successful to prevent further attempts
				successful = true
			
			} catch (error:any) {
				
				// Check if this is a retryable error and we haven't exceeded max retries
				if (isRetryableError(error) && attempt < maxRetries) {

					retryCount++
					
					// Log retry attempt
					reportDebug({
						location	: 'build > (request try catch)',
						message		: `Retrying ${type}/${name} (attempt ${retryCount}/${maxRetries}) after error: ${error.message}`,
						args		: { type, name, variables, values, retryCount, maxRetries },
					})
					
					// Wait with exponential backoff before retrying
					const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000) // Max 10 seconds

					await delay(backoffTime)

					// Continue to next iteration of the loop
					continue
				}
				
				// If we get here, either the error is not retryable or we've exceeded max retries
				if		(Object.hasOwn(error, 'graphQLErrors') && error.graphQLErrors.length > 0)	result = { error:`${formatError(error.graphQLErrors)}` }
				else if	(Object.hasOwn(error, 'message'))											result = { error:`${error.name}: ${error.message}`}
				else																				result = { error }
				
				// No more retries, exit the loop
				break
			}
		}
	
	} else result = { error:'gql was empty' }

	await client.clearStore()

	client.stop()

	if (Object.hasOwn(result, 'error'))	{

		for (const v in values) {

			if (values[v] instanceof File) values[v] = {
				size			: values[v].size,
				type			: values[v].type,
				name			: values[v].name,
				lastModified	: values[v].lastModified
			}
		}

		const args = { type, name, variables, values, ...context }

		result = { error: reportError({
			location	: 'build > (post request)',
			message		: 'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com (WEB-API-0)',
			error		: result.error,
			args,
			result		: {query},
		})}
		
	} else if (debug) {
		
		const args = { type, name, variables, values, ...context }

		reportDebug({
			location	: 'build > (post request)',
			message		: `${type}/${name} completed`,
			args,
			result		: { query, ...result }
		})
	}

	return result
}