import type { LayoutServerLoad } from './$types'
import { apiV2 } from 'src/lib/server/apiV2/api'



export const load = (async ({ locals }) => {

	const { locations, apiError: locationsError } = await apiV2.locations()
	
	const { skus, apiError: skusError } = await apiV2.skusOrderedByCompany()

	// Collect any errors for client-side reporting
	const layoutErrors = [locationsError, skusError].filter(Boolean)

	return { 
		...locals, 
		locations, 
		skus,
		layoutErrors: layoutErrors.length > 0 ? layoutErrors : null
	}

}) satisfies LayoutServerLoad