import type { Actions } from './$types'

import { checkout } from 'src/lib/server/checkout'
 


export const actions = {

	placeOrder : async ({ request, cookies }) => await checkout.placeOrder(request, cookies)

} satisfies Actions