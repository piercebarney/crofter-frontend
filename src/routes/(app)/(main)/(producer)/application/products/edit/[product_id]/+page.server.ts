import type { PageServerLoad } from './$types'

import { fail } from '@sveltejs/kit'
import { api } from 'src/lib/server/api/api'



export const load = (async ({ params }) => {

	const { product } = await api.product({ variables:{productId:params.product_id} })

	if (!product) return fail(404)

	return { product }

}) satisfies PageServerLoad