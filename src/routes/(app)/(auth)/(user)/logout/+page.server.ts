import type { PageServerLoad } from './$types'

import { auth } from 'src/lib/server/auth'
 


export const load = (async ({ cookies }) => {

	await auth.logout(cookies)

	return {}

}) satisfies PageServerLoad