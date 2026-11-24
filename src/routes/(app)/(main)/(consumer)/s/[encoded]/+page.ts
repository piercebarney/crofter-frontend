import type { PageLoad } from './$types'

import { redirect } from '@sveltejs/kit'
// import { search } from 'src/features/groups/search/store' v1 pause
// import { api } from 'src/lib/api' v1 pause
// import { fulfillments as f } from 'src/lists/fulfillments' v1 pause


// export const load = (async ({ params, url, fetch }) => { v1 pause
export const load = (async () => {

	redirect(307, '/') // v1 pause

	// v1 pause
	// const filterBy_term 	= decodeURIComponent(params.encoded)
	// const zipCode			= url.searchParams.get('z')
	// const fulfillment		= url.searchParams.get('f')
	// const proximity			= Number(url.searchParams.get('p'))

	// const variables: Record<string,string|number> = {filterBy_term}

	// if (zipCode) 			variables['address_zipCode'] = zipCode
	// if (fulfillment)		variables['filterBy_fulfillment'] = f.get('name', fulfillment)?.filter
	// if (proximity)			variables['proximity_miles'] = proximity

	// const { nearby } = await api.productSearch({ variables, key:'nearby' }, fetch)

	// const filterBy_fulfillment: string = f.get('name', 'delivery')?.filter

	// const { delivery } = await api.productSearch({ variables:{filterBy_term, filterBy_fulfillment}, key:'delivery' }, fetch)

	// const products = {nearby, delivery}

	// if (!search.get('term')) search.set({term:filterBy_term})

	// search.set({results:products?products:[], searching:false})

	// return { products }

}) satisfies PageLoad