import type { Actions, PageServerLoad } from './$types'

import { auth } from 'src/lib/server/auth'
 


export const load = (async ({ url, cookies }) => {

	const token	= url.searchParams.get('auth_token')
	const error	= url.searchParams.get('error')

	if (token) await auth.signup(null, cookies, false, token)

	return { error }

}) satisfies PageServerLoad

export const actions = {

	default: async ({ request, cookies }) => await auth.signup(request, cookies)

} satisfies Actions