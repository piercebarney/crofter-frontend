type ApiOptions = Record<string, any>
type ApiResponse = Record<string, any>
type FetchFunction = typeof fetch

import { goto } from '$app/navigation'
import { browser } from '$app/environment'
import { routes } from 'src/lists/routes'
import { reporter, type ErrorReport } from 'src/lib/reporter/module'


const file			= 'src/lib/api.ts'
const reportError	= reporter({type:'error', file})
const url			= '/api/v1'

export const api = new Proxy({}, {

	get: (_target, name: string | symbol) => {

		const action = `${file} > ${typeof name == 'string' ? name : name.description}`

		return async (options: ApiOptions, doFetch: FetchFunction = fetch): Promise<ApiResponse> => {

			// Check for impersonation state from cookies and add to options if needed
			if (browser) {
				const getCookie = (name: string): string | null => {
					const nameEQ = name + "="
					const ca = document.cookie.split(';')
					for(let i = 0; i < ca.length; i++) {
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

				if (response.ok) {

					if (data.error) {

						if (data.error.message?.includes('Sign-in required!')) {

							// Make sure we have a valid route
							const authPathname = routes.authPathname || '/auth'

							if (browser) goto(authPathname)

						} else {

							const errorReport: ErrorReport = {
								action,
								location	: 'response.ok > data.error',
								message		: typeof data.error === 'string' ? data.error : data.error.message || 'Unknown error',
								args		: { name, ...options }
							}

							data.error = reportError(errorReport)
						}
					}

					return { ...data }

				} else {
					
					const errorReport: ErrorReport = {
						action,
						location	: 'response.!ok',
						message		: data.message || response.statusText || `Error ${response.status}`,
						args		: { name, ...options }
					}

					const errorMessage = reportError(errorReport)

					throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API Error')
				}

			} catch (error) {

				const errorReport: ErrorReport = {
					action,
					location	: 'api.catch',
					message		: error instanceof Error ? error.message : String(error),
					error		: error instanceof Error ? error : undefined,
					args		: { name, ...options }
				}

				const errorMessage = reportError(errorReport)

				throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API Error')
			}
		}
	}

}) as Record<string, (options?: ApiOptions, doFetch?: FetchFunction) => Promise<ApiResponse>>