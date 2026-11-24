import type { PageServerLoad } from './$types'
import type { Actions } from './$types'


import { redirect } from '@sveltejs/kit'
import { auth } from 'src/lib/server/auth'
import { routes } from 'src/lists/routes'
 


export const load = (async ({ locals }) => {

	const user = locals.user

	if (user.id && user.companies.length > 0) {

		for (const company of user.companies) {

			if (company.role == 'PRODUCER') {

				if	(company.ziftAccountId) throw redirect(307, routes.producerDefaultPathname)
				else						throw redirect(307, routes.pathname('application'))
			}
		}
	}

	return { ...locals }

}) satisfies PageServerLoad

export const actions = {

	newuser: async ({ request, cookies }) => await auth.registerNewUser(request, cookies),

	existinguser: async ({ request, cookies }) => await auth.registerExistingUser(request, cookies)

} satisfies Actions