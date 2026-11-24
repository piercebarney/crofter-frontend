import { goto } from '$app/navigation'
import { routes } from 'src/lists/routes'



export const auth = (pathname:string, userId:string, cancel:()=>void) => {

	const isProtected	= routes.protected(pathname)
	const hasNoUser		= userId ? false : true

	if (isProtected && hasNoUser) { cancel(); goto(routes.authPathname) }
}