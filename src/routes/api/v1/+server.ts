import type { RequestHandler } from './$types'

import { json, error } from '@sveltejs/kit'
import { api } from 'src/lib/server/api/api'


/**
 * Add no-cache headers to prevent API responses from being cached
 * in web browsers, PWAs, and Capacitor native apps
 */
function addNoCacheHeaders(response: Response): Response {
	
	// Prevent all caching
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
	response.headers.set('Pragma', 'no-cache')
	response.headers.set('Expires', '0')
	response.headers.set('Surrogate-Control', 'no-store')
	
	return response
}


export const POST = (async ({ request, cookies }) => {

	const { name, options: bodyOptions } = await request.json() as Record<string,any>

	const options: Record<string,any>	= typeof bodyOptions == 'object' && bodyOptions ? bodyOptions : {}

	const token			= cookies.get('AuthorizationToken')
	const guestToken	= cookies.get('GuestToken')

	if		(token)			options.token		= token
	else if	(guestToken)	options.guestToken	= guestToken



	if (!Object.hasOwn(api, name)) throw error(400, `API [${name}] does not exist`)

	// if (!token && !guestToken) {
	
	// 	if (name == 'cartAddCartItem' || name == 'cartAddCartItem_partial') {
			
	// 		const { cart } = await api.cart({ ...options })
			
	// 		cookies.set('GuestToken', cart.userUuid, {
	// 			httpOnly: true,
	// 			path: '/',
	// 			secure: true,
	// 			sameSite: 'strict',
	// 			maxAge: 60 * 60 * 24 // 1 day
	// 		})

	// 		options.guestToken = cart.userUuid

	// 	} else if (name == 'cart') return addNoCacheHeaders(json({ cart:{id:null} }))
	// }

	// Apply no-cache headers to the response
	return addNoCacheHeaders(json(await api[name]({ ...options })))
	
}) satisfies RequestHandler