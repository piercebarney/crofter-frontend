import type { PageServerLoad } from './$types'

// import { fail } from '@sveltejs/kit'
// import { api } from 'src/lib/server/api/api'
import { redirect } from '@sveltejs/kit'



export const load = (async ({ params }) => {

	throw redirect(307, `/?c=${params.company_id}`)
	
	// const { company } = await api.companyPage({ variables:{companyId:params.company_id} })

	// if (!company) return fail(404)

	// if (company.role != 'PRODUCER') return fail(404)

	// return { company }

}) satisfies PageServerLoad