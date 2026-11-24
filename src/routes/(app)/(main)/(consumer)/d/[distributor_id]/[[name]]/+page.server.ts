import type { PageServerLoad } from './$types'

import { fail } from '@sveltejs/kit'
import { api } from 'src/lib/server/api/api'



export const load = (async ({ params }) => {

	const { company } = await api.companyPage({ variables:{companyId:params.distributor_id} })

	if (!company) return fail(404)

	if (company.role != 'DISTRIBUTOR') return fail(404)

	return { company }

}) satisfies PageServerLoad