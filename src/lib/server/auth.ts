import type { Cookies } from '@sveltejs/kit'

import { PUBLIC_SECURE_COOKIES, PUBLIC_API_URL } from '$env/static/public'
import { redirect, fail } from '@sveltejs/kit'
// import jwt from '@tsndr/cloudflare-worker-jwt'
import { routes } from 'src/lists/routes'
import { validate } from 'src/lib/validate'
import { api } from 'src/lib/server/api/api'
import { apiV2 } from 'src/lib/server/apiV2/api'



// REST API helpers for password-based auth endpoints
const restAuth = {

	register: async (payload: {
		email: string
		password: string
		password_confirmation: string
		first_name?: string
		last_name?: string
		phone_number?: string
		addresses?: Array<{
			zip_code: string
			latitude?: number
			longitude?: number
		}>
	}, guestToken?: string): Promise<{ token?: string; error?: any }> => {

		try {

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}

			if (guestToken) headers['guest-session'] = guestToken

			const requestBody = { user: payload }

			const response = await fetch(`${PUBLIC_API_URL}/auth/user/password/register`, {
				method: 'POST',
				headers,
				body: JSON.stringify(requestBody)
			})

			const data = await response.json()

			if (!response.ok) {

				console.error('Registration failed:', {
					status: response.status,
					statusText: response.statusText,
					data
				})

				// Parse Ash framework error format
				let errorMessage = 'Registration failed'
				
				if (data.authentication?.reason) {
					// Extract message from Ash error string
					const messageMatch = data.authentication.reason.match(/message: "([^"]+)"/)
					if (messageMatch) {
						errorMessage = messageMatch[1]
					}
				} else if (data.error) {
					errorMessage = data.error
				} else if (data.errors) {
					errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : data.errors
				}

				return {
					error: errorMessage
				}
			}

			return { token: data.authentication.token }

		} catch (error) {

			return {
				error: error instanceof Error ? error.message : 'Network error during registration'
			}
		}
	},

	signIn: async (payload: {
		email: string
		password: string
	}, guestToken?: string): Promise<{ user?: any; token?: string; error?: any }> => {

		try {

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}

			if (guestToken) headers['guest-session'] = guestToken

			const response = await fetch(`${PUBLIC_API_URL}/auth/user/password/sign_in`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ user: payload })
			})

			const data = await response.json()

			if (!response.ok) {

				let errorMessage = 'Login failed'
				
				if (data.authentication?.reason) {

					const messageMatch = data.authentication.reason.match(/message: "([^"]+)"/)

					if (messageMatch) errorMessage = messageMatch[1]

				} else if (data.error) errorMessage = data.error
				else if (data.errors) errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : data.errors

				return { error:errorMessage }
			}

			return { user:data.user, token:data.authentication.token }

		} catch (error) {

			return { error: error instanceof Error ? error.message : 'Network error during login' }
		}
	},

	resetRequest: async (payload: {
		email: string
	}): Promise<{ success?: boolean; error?: any }> => {

		try {

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}

			const response = await fetch(`${PUBLIC_API_URL}/auth/user/password/reset_request`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ user: payload })
			})

			const data = await response.json()

			if (!response.ok) {

				let errorMessage = 'Password reset request failed'
				
				if (data.authentication?.reason) {
					const messageMatch = data.authentication.reason.match(/message: "([^"]+)"/)
					if (messageMatch) errorMessage = messageMatch[1]
				} else if (data.error) {
					errorMessage = data.error
				} else if (data.errors) {
					errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : data.errors
				}

				return {
					error: errorMessage
				}
			}

			return { success: true }

		} catch (error) {

			return {
				error: error instanceof Error ? error.message : 'Network error during password reset request'
			}
		}
	},

	reset: async (payload: {
		password: string
		password_confirmation: string
		reset_token: string
	}): Promise<{ success?: boolean; error?: any }> => {

		try {

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}

			const response = await fetch(`${PUBLIC_API_URL}/auth/user/password/reset`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ user: payload })
			})

			const data = await response.json()

			if (!response.ok) {

				let errorMessage = 'Password reset failed'
				
				if (data.authentication?.reason) {
					const messageMatch = data.authentication.reason.match(/message: "([^"]+)"/)
					if (messageMatch) errorMessage = messageMatch[1]
				} else if (data.error) {
					errorMessage = data.error
				} else if (data.errors) {
					errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : data.errors
				}

				return {
					error: errorMessage
				}
			}

			return { success: true }

		} catch (error) {

			return {
				error: error instanceof Error ? error.message : 'Network error during password reset'
			}
		}
	},

	// signInWithToken: async (authToken: string): Promise<{ user?: any; token?: string; error?: any }> => {

	// 	try {

	// 		const headers: Record<string, string> = {
	// 			'Accept': 'application/json'
	// 		}

	// 		const response = await fetch(`${PUBLIC_API_URL}/auth/user/password/sign_in_with_token?token=${encodeURIComponent(authToken)}`, {
	// 			method: 'GET',
	// 			headers
	// 		})

	// 		const data = await response.json()

	// 		if (!response.ok) {

	// 			let errorMessage = 'Token authentication failed'
				
	// 			if (data.authentication?.reason) {
					
	// 				const messageMatch = data.authentication.reason.match(/message: "([^"]+)"/)
					
	// 				if (messageMatch) errorMessage = messageMatch[1]
				
	// 			} else if (data.error) errorMessage = data.error
	// 			else if (data.errors) errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : data.errors

	// 			return { error:errorMessage }
	// 		}

	// 		return { user:data.user, token:data.authentication.token }

	// 	} catch (error) {

	// 		return { error: error instanceof Error ? error.message : 'Network error during token authentication' }
	// 	}
	// }
}


export const auth = {

	token : (cookies:Cookies, doRedirect:boolean = true) => {

		const token = cookies.get('AuthorizationToken')

		if (token) {

			cookies.set('AuthCheck', 'pass', {
				httpOnly	: false,
				path		: '/',
				secure		: PUBLIC_SECURE_COOKIES === 'true',
				maxAge		: 60 * 60 * 24 * 30 // 30 days
			})
			
			// Check for impersonation and include if present
			const impersonatedUserId = cookies.get('ImpersonatedUserId')
			const result: Record<string, any> = { token }
			
			if (impersonatedUserId) {
				// Decode the cookie value in case it was encoded
				try {
					const decodedUserId = decodeURIComponent(impersonatedUserId)
					result.impersonateUserId = decodedUserId
				} catch {
					result.impersonateUserId = impersonatedUserId
				}
			}
			
			return result

		} else if (doRedirect) throw redirect(307, routes.authPathname)
		
		return false
	},

	check : async (cookies:Cookies, url:URL) => {

		// console.log('check')

		const href		= url.href
		const pathname	= url.pathname

		let user:any = { id:null }

		if (pathname == '/api' || href.includes('/account?/') || href.includes('/register?/') || href.includes('/auth?/') || href.includes('/checkout?/') || href.includes('/products?/')) return { user }
		
		const token	= cookies.get('AuthorizationToken')
		const path	= pathname + url.search
		
		// If no token in cookies but auth_token in URL, we're in the middle of auth flow
		if (!token && url.searchParams.get('auth_token')) {
			// Don't check auth requirements during auth flow
			return { user }
		}

		if (token && routes.auth(pathname) && !routes.same('logout', pathname) && !routes.same('register', pathname)) {

			throw redirect(307, routes.default())

		} else if (routes.user(pathname)) {

			if (token) {

				let error,
					impersonateUserId

				
				// Check for impersonation cookie
				const impersonatedUserId = cookies.get('ImpersonatedUserId')
				
				if (impersonatedUserId) {

					// Decode the cookie value in case it was encoded
					try {

						const decodedUserId = decodeURIComponent(impersonatedUserId)

						impersonateUserId = decodedUserId

					} catch {
						
						impersonateUserId = impersonatedUserId
					}
				}

				({ user, error } = await apiV2.userByToken({ token, impersonateUserId }))

				if (error) {

					cookies.delete('AuthorizationToken', { path: '/' })

					cookies.set('AuthCheck', 'fail', {
						httpOnly	: false,
						path		: '/',
						secure		: PUBLIC_SECURE_COOKIES === 'true',
						maxAge		: 60 * 60 * 24 * 30 // 30 days
					})
					
					throw redirect(307, routes.authPathname)
				
				} else {

					cookies.delete('AuthRedirect', { path: '/' })

					cookies.set('AuthCheck', 'pass', {
						httpOnly	: false,
						path		: '/',
						secure		: PUBLIC_SECURE_COOKIES === 'true',
						maxAge		: 60 * 60 * 24 * 30 // 30 days
					})
				}

			} else if (routes.protected(pathname)) {

				const authCheck = cookies.get('AuthCheck')

				cookies.set('AuthRedirect', path, {
					httpOnly	: false,
					path		: '/',
					secure		: PUBLIC_SECURE_COOKIES === 'true',
					maxAge		: 60 * 60 // 1 hour
				})

				if (authCheck == 'pass' || authCheck === undefined) {

					cookies.set('AuthCheck', 'reload', {
						httpOnly	: false,
						path		: '/',
						secure		: PUBLIC_SECURE_COOKIES === 'true',
						maxAge		: 60 * 60 // 1 hour
					})

				} else {

					cookies.set('AuthCheck', 'fail', {
						httpOnly	: false,
						path		: '/',
						secure		: PUBLIC_SECURE_COOKIES === 'true',
						maxAge		: 60 * 60 // 1 hour
					})
				}
				
				throw redirect(307, routes.loginPathname)
			}
		}

		return { user }
	},

	signup : async (request:Request|null, cookies:Cookies, tool:boolean = false, token:string|null = null) => {

		if (request) {

			const variables = Object.fromEntries(await request.formData())

			const terms = variables.terms as string

			const { fail:phoneNumberFail }	= validate.phoneNumber(variables, false)
			const { fail:emailFail }		= validate.email(variables)
			const { fail:zipCodeFail }		= validate.zipCode(variables)
			const { fail:passwordFail } 	= validate.password(variables)

			if (!terms)				return fail(400, { variables, error:'Agreeing to the Terms and Conditions is required' })
			if (phoneNumberFail)	return fail(400, { variables, error:phoneNumberFail })
			if (emailFail)			return fail(400, { variables, error:emailFail })
			if (zipCodeFail)		return fail(400, { variables, error:zipCodeFail })
			if (passwordFail)		return fail(400, { variables, error:passwordFail })

			const guestToken = cookies.get('GuestToken')

			let error: any

			// Build payload for REST API
			const payload: any = {
				email					: variables.email as string,
				password				: variables.password as string,
				password_confirmation	: variables.password as string
			}

			if (variables.firstName) payload.first_name = variables.firstName as string
			if (variables.lastName) payload.last_name = variables.lastName as string
			if (variables.phoneNumber) payload.phone_number = variables.phoneNumber as string
			
			if (variables.zipCode) {
				payload.addresses = [{
					zip_code	: variables.zipCode as string,
					is_default	:  new Date().toISOString()
				}]
			}

			const result = await restAuth.register(payload, guestToken)

			if (result.error) {

				error = result.error

				if		(typeof error == 'string')	return fail(401, { variables, error })
				else if	(error.message)				return fail(401, { variables, error:error.message })
				else								return fail(500, { variables, error:'Server Error: Could not create user' })
			}

			token = result.token || null

		}

		if (!token) return fail(401, { error:'Missing token' })
		
		cookies.delete('GuestToken', { path: '/' })

		cookies.set('AuthorizationToken', token, {
			httpOnly	: true,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			sameSite	: 'lax',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		cookies.set('AuthCheck', 'pass', {
			httpOnly	: false,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		if (tool) {

			const { user, error:userError } = await apiV2.userByToken({ token })

			return { data:user, error:userError }

		} else {

			const authRedirect = cookies.get('AuthRedirect')

			cookies.delete('AuthRedirect', { path: '/' })
		
			throw redirect(302, authRedirect ? authRedirect : routes.default())
		}
	},

	registerExistingUser : async (request:Request, cookies:Cookies) => {

		// get form data
		const variables = Object.fromEntries(await request.formData() as unknown as Iterable<[string, FormDataEntryValue]>)

		const name = variables.name as string

		// validate
		const error:Record<string,string> = {_type:'group'}
		
		const { fail:emailFail } = validate.email(variables)

		if (!name)		error['name']	= 'Name is required'
		if (emailFail)	error['email']	= emailFail as string

		if (Object.keys(error).length > 1) return fail(400, {error})

		// create company
		const { company, error:errorCompany } = await api.companyCreate({ variables, ...auth.token(cookies) })

		// error check
		if (errorCompany) {
			
			if	(typeof errorCompany == 'string')	return fail(401, { variables, error:errorCompany })
			else									return fail(500, { variables, error:'Server Error: Could not create company' })
		}

		const { application, error:errorApplication } = await api.companyMerchantApplicationSave({ variables:{companyId:company.id, business_businessName:name}, ...auth.token(cookies) })

		if (errorApplication) {
				
			if	(typeof errorApplication == 'string')	return fail(401, { variables, error:errorApplication })
			else										return fail(500, { variables, error:'Server Error: application api' })
		}

		return { data:{company, application} }

		// redirect
		// throw redirect(302, routes.pathname('application'))

	},

	registerNewUser : async (request:Request, cookies:Cookies) => {

		// get form data
		const variables = Object.fromEntries(await request.formData())

		const name		= variables.name	as string
		const zipCode	= variables.zipCode	as string
		const terms		= variables.terms	as string

		// validate
		const error:Record<string,string> = {_type:'group'}

		const { fail:emailFail }	= validate.email(variables)
		const { fail:passwordFail } = validate.password(variables)
		const { fail:zipCodeFail }	= validate.zipCode(variables)

		if (!name)			error['name']			= 'Name is required'
		if (!zipCode)		error['zipCode']		= 'Zip code is required'
		if (!terms)			error['_check-terms']	= 'Agreeing to the Terms and Conditions is required'
		if (passwordFail)	error['password']		= passwordFail as string
		if (emailFail)		error['email']			= emailFail as string
		if (zipCodeFail)	error['zipCode']		= zipCodeFail as string

		if (Object.keys(error).length > 1) return fail(400, {error})

		// register
		const guestToken = cookies.get('GuestToken')

		const payload: any = {
			email					: variables.email as string,
			password				: variables.password as string,
			password_confirmation	: variables.password as string
		}

		if (variables.firstName) payload.first_name = variables.firstName as string
		if (variables.lastName) payload.last_name = variables.lastName as string
		if (variables.phoneNumber) payload.phone_number = variables.phoneNumber as string
		
		if (zipCode) {
			payload.addresses = [{
				zip_code	: zipCode,
				is_default	:  new Date().toISOString()
			}]
		}

		const result = await restAuth.register(payload, guestToken)

		// error check
		if (result.error) {

			const registerError = result.error

			if		(typeof registerError == 'string')	return fail(401, { variables, error:registerError })
			else if	(registerError.message)				return fail(401, { variables, error:registerError.message })
			else										return fail(500, { variables, error:'Server Error: Could not create user' })
		}

		const token = result.token

		if (!token) return fail(500, { variables, error:'Server Error: No token returned' })

		// set cookies
		if (guestToken) cookies.delete('GuestToken', { path: '/' })

		cookies.set('AuthorizationToken', token, {
			httpOnly	: true,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			sameSite	: 'lax',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		cookies.set('AuthCheck', 'pass', {
			httpOnly	: false,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		// get user
		const { user, error:userError } = await apiV2.userByToken({ token })

		if (userError) {

			if	(typeof userError == 'string')	return fail(401, { variables, error:userError })
			else								return fail(500, { variables, error:'Server Error: user api' })
		}

		// create company
		// variables.newUserId = user.id

		const { company, error:errorCompany } = await api.companyCreate({ variables, ...auth.token(cookies) })

		// error check
		if (errorCompany) {
				
			if	(typeof errorCompany == 'string')	return fail(401, { variables, error:errorCompany })
			else									return fail(500, { variables, error:'Server Error: company api' })
		}

		const { application, error:errorApplication } = await api.companyMerchantApplicationSave({ variables:{companyId:company.id, business_businessName:name}, ...auth.token(cookies) })

		if (errorApplication) {
				
			if	(typeof errorApplication == 'string')	return fail(401, { variables, error:errorApplication })
			else										return fail(500, { variables, error:'Server Error: application api' })
		}

		return { data:{user, company, application} }

		// redirect
		// throw redirect(302, routes.pathname('application'))
	},

	login : async (request:Request|null, cookies:Cookies, tool:boolean = false, token:string|null = null) => {

		// console.log('login')

		if (request) {

			const variables	= Object.fromEntries(await request.formData())
			const email		= variables.email		as string
			const password	= variables.password	as string

			if (!email)		return fail(400, { variables, error: 'Missing email' })
			if (!password)	return fail(400, { variables, error: 'Missing password' })

			const guestToken = cookies.get('GuestToken')

			const payload = {
				email,
				password
			}

			const result = await restAuth.signIn(payload, guestToken)

			console.log('result > ', result)

			if (result.error) {

				const error = result.error

				if		(typeof error == 'string')	return fail(401, { variables, error })
				else if	(error.message)				return fail(401, { variables, error:error.message })
				else								return fail(500, { variables, error:'Server Error: Could not login' })
			}

			token = result.token || null

		}

		if (!token) return fail(401, { error:'Missing token' })

		cookies.delete('GuestToken', { path: '/' })

		cookies.set('AuthorizationToken', token, {
			httpOnly	: true,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			sameSite	: 'lax',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		cookies.set('AuthCheck', 'pass', {
			httpOnly	: false,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		if (tool) {

			const { user, error:userError } = await apiV2.userByToken({ token })

			return { data:user, error:userError }

		} else {

			const authRedirect = cookies.get('AuthRedirect')

			cookies.delete('AuthRedirect', { path: '/' })
		
			throw redirect(302, authRedirect ? authRedirect : routes.default())
		}
	},

	logout : async (cookies:Cookies) => {

		cookies.delete('AuthorizationToken', { path: '/' })
		
		// Also clear impersonation cookies on logout
		cookies.delete('ImpersonatedUserId', { path: '/' })
		cookies.delete('ImpersonatedUserEmail', { path: '/' })

		cookies.set('AuthCheck', 'fail', {
			httpOnly	: false,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			maxAge		: 60 * 60 // 1 hour
		})

		// throw redirect(302, routes.default())

		return true
	},

	forgot : async (request:Request) => {

		const variables	= Object.fromEntries(await request.formData())
		
		const { fail:emailFail } = validate.email(variables)

		if (emailFail) return fail(400, { variables, error:emailFail })

		const payload = {
			email: variables.email as string
		}

		const result = await restAuth.resetRequest(payload)

		if (result.error) {

			const error = result.error

			if		(typeof error == 'string')	return fail(401, { variables, error })
			else if	(error.message)				return fail(401, { variables, error:error.message })
			else								return fail(500, { variables, error:'Server Error: Could not request password reset' })
		}

		throw redirect(302, routes.authPathname)
	},

	reset : async (request:Request) => {

		const variables	= Object.fromEntries(await request.formData())

		const { fail:passwordFail } = validate.password(variables)

		if (passwordFail) return fail(400, { variables, error:passwordFail })

		const payload = {
			password				: variables.password as string,
			password_confirmation	: variables.password as string,
			reset_token				: variables.token as string
		}

		const result = await restAuth.reset(payload)

		if (result.error) {

			const error = result.error

			if		(typeof error == 'string')	return fail(401, { variables, error })
			else if	(error.message)				return fail(401, { variables, error:error.message })
			else								return fail(500, { variables, error:'Server Error: Could not reset password' })
		}

		throw redirect(302, routes.authPathname)

	}	
}