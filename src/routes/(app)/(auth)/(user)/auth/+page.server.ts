import type { Actions } from './$types'

import { auth } from 'src/lib/server/auth'
 


export const actions = {

	login: async ({ request, cookies }) => await auth.login(request, cookies, true),

	signup: async ({ request, cookies }) => await auth.signup(request, cookies, true),

} satisfies Actions