import type { PageServerLoad } from './$types'



export const load = (async ({ url }) => {

	const orderId = url.searchParams.get('id')

	return { orderId }

}) satisfies PageServerLoad