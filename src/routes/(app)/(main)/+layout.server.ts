import type { LayoutServerLoad } from './$types'



export const load = (async ({ cookies }) => {
	
	// Check for impersonation
	const impersonatedUserId = cookies.get('ImpersonatedUserId')
	const options: Record<string, any> = {}
	
	if (impersonatedUserId) {

		// Decode the cookie value in case it was encoded
		try {

			const decodedUserId = decodeURIComponent(impersonatedUserId)

			options.impersonateUserId = decodedUserId

		} catch {
			
			options.impersonateUserId = impersonatedUserId
		}
	}

}) satisfies LayoutServerLoad