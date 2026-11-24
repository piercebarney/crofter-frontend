import type { PageServerLoad } from './$types'

import { redirect } from '@sveltejs/kit'
import { routes } from 'src/lists/routes'
import { auth } from 'src/lib/server/auth'
import { apiV2 } from 'src/lib/server/apiV2/api'



export const load = (async ({ cookies, params, locals }) => {

	if (params.user_id == locals.user.id) {

		const id = params.user_id

		await apiV2.user({ id, set:{emailVerified:true}, ...auth.token(cookies) })
	}

	throw redirect(307, routes.consumerDefaultPathname)

}) satisfies PageServerLoad