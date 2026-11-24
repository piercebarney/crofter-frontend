import type { Actions, PageServerLoad } from './$types'
import { auth } from 'src/lib/server/auth'
 


export const load = (async ({ url, cookies }) => {

	const token	= url.searchParams.get('auth_token')
	const error	= url.searchParams.get('error')
	
	let authSuccess = false

	if (token) {

		await auth.login(null, cookies, false, token)
		
		authSuccess = true
	}

	return { error, authSuccess }

}) satisfies PageServerLoad

export const actions = {

	default: async ({ request, cookies }) => await auth.login(request, cookies)

} satisfies Actions