import type { PageLoad } from './$types'

import { api } from 'src/lib/api'



export const load = (async ({ params, fetch }) => {

	const productId = decodeURIComponent(params.product_id)

	const { product } = await api.product({ variables:{productId} }, fetch)

	return { product }

}) satisfies PageLoad