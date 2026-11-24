type ApiOptions = Record<string, any>
type ApiResponse = Record<string, any>
type FetchFunction = typeof fetch

import { goto } from '$app/navigation'
import { browser } from '$app/environment'
import { routes } from 'src/lists/routes'
import { reporter, type ErrorReport } from 'src/lib/reporter/module'



const reportError	= reporter({type:'error', file:'src/lib/apiV2.ts'})
const url			= '/api/v2'

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

		return async (options: ApiOptions, doFetch: FetchFunction = fetch): Promise<ApiResponse> => {

			// Check for impersonation state from cookies and add to options if needed
			if (browser) {

				const getCookie = (name: string): string | null => {

					const nameEQ = name + "="

					const ca = document.cookie.split(';')

					for (let i = 0; i < ca.length; i++) {

						let c = ca[i]

						while (c.charAt(0) == ' ') c = c.substring(1, c.length)

						if (c.indexOf(nameEQ) == 0) {

							const value = c.substring(nameEQ.length, c.length)

							try {

								return decodeURIComponent(value)

							} catch {

								return value
							}
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

			// Make the API call
			try {

				const response = await doFetch(url, {
					method	: 'POST',
					body	: JSON.stringify({ 
						name, 
						options,
						// Add timestamp to prevent caching
						_t: Date.now() 
					}),
					headers	: { 
						'content-type'	: 'application/json',
						// Add cache-busting headers
						'Cache-Control'	: 'no-cache, no-store, must-revalidate',
						'Pragma'		: 'no-cache',
						'Expires'		: '0'
					},
					// Ensure fetch doesn't use cache
					cache: 'no-store'
				})

				const data = await response.json()

				// Check for errors
				if (response.ok) {

					// Check for API errors
					if (data.error) {

						const { message, error } = parseError(data.error)

						if (message.includes('Sign-in required!')) {

							// Make sure we have a valid route
							const authPathname = routes.authPathname || '/auth'

							goto(authPathname)

						} else {

							const errorReport: ErrorReport = {
								error,
								location	: 'response.ok > data.error',
								message,
								args		: { name, ...options }
							}

							data.error = reportError(errorReport)
						}
					}

					return { ...data }

				// Check for non-2xx status
				} else {

					const { message, error } = parseError(data.error)
					
					const errorReport: ErrorReport = {
						error,
						location	: 'response.!ok',
						message,
						args		: { name, ...options }
					}

					const errorMessage = reportError(errorReport)

					throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API Error')
				}

			} catch (error) {

				console.log({error})

				const { message, error:catchError } = parseError(error)

				const errorReport: ErrorReport = {
					error		: catchError,
					location	: 'api.catch',
					message,
					args		: { name, ...options }
				}

				const errorMessage = reportError(errorReport)

				throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API Error')
			}
		}
	}

}) as Record<string, (options?: ApiOptions, doFetch?: FetchFunction) => Promise<ApiResponse>>