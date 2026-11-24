import type { Actions } from './$types'

import { auth } from 'src/lib/server/auth'
 


export const actions = {

	default: async ({ request }) => await auth.forgot(request)

} satisfies Actions