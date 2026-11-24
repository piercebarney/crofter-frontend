import type { LayoutServerLoad } from './$types'

import { redirect } from '@sveltejs/kit'
import { routes } from 'src/lists/routes'



export const load = (async ({ locals }) => {

	const user = locals.user

	if (user.id && user.companies.length > 0) {

		for (const company of user.companies) {

			if (company.role == 'PRODUCER' && !company.ziftAccountId) throw redirect(307, routes.pathname('application'))
		}
	}

	return { ...locals }

}) satisfies LayoutServerLoad