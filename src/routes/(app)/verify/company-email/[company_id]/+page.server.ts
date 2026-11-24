import type { PageServerLoad } from './$types'

import { redirect } from '@sveltejs/kit'
import { routes } from 'src/lists/routes'
import { auth } from 'src/lib/server/auth'
import { api } from 'src/lib/server/api/api'



export const load = (async ({ cookies, params, locals }) => {

	const companyId = params.company_id

	if (locals.user.companies.length > 0) {
		
		for (const company of locals.user.companies) {

			if (company.id == companyId) await api.companyUpdate({variables:{companyId, emailVerified:true}, ...auth.token(cookies)})

		}

	}

	throw redirect(307, routes.producerDefaultPathname)

}) satisfies PageServerLoad