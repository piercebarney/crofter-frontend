import type { PageServerLoad } from './$types'
import type { Actions } from './$types'

import { redirect } from '@sveltejs/kit'
import { auth } from 'src/lib/server/auth'
import { routes } from 'src/lists/routes'



export const load = (async ({ url }) => {

	const token = url.searchParams.get('token')
	
	if (!token) throw redirect(307, routes.authPathname)

	return { token }

}) satisfies PageServerLoad


export const actions = {

	default: async ({ request }) => await auth.reset(request)

} satisfies Actions