import type { PageServerLoad } from './$types'

import { auth } from 'src/lib/server/auth'
import { apiV2 } from 'src/lib/server/apiV2/api'



export const load = (async ({ cookies, url }) => {

	const orderId = url.searchParams.get('id')

	return {
		orders	: apiV2.customerOrders({ ...auth.token(cookies) }).then(({ orders }) => orders),
		orderId
	}

}) satisfies PageServerLoad