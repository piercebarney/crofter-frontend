import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load = (async ({ cookies }) => {
	// Clear impersonation cookies
	cookies.delete('ImpersonatedUserId', { path: '/' })
	cookies.delete('ImpersonatedUserEmail', { path: '/' })
	
	// Redirect to admin portal
	throw redirect(302, '/admin')
}) satisfies PageServerLoad