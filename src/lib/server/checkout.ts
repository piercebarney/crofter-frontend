import type { Cookies } from '@sveltejs/kit'

import { auth } from 'src/lib/server/auth'
import { apiV2 } from 'src/lib/server/apiV2/api'



export const checkout = {

	placeOrder : async (request:Request, cookies:Cookies) => {

		const variables			= Object.fromEntries(await request.formData())
		const orderItemsIds		= JSON.parse(variables.orderItemsIds as string)
		const userId			= variables.userId as string

		const { orderId, error } = await apiV2.orderSubmit({ set:{orderItemsIds, userId}, ...auth.token(cookies)})

		return { data:orderId, error }
	}
}