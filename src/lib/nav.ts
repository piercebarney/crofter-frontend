import { goto } from '$app/navigation'
import { search } from 'src/features/groups/search/store'
import { layout } from 'src/stores/layout'
import { modal } from 'src/features/modules/modal/store'
import { header } from 'src/features/modules/header/store'
import { routes } from 'src/lists/routes'



export const nav = (to:any, from:any, cancel:(()=>void)) => {

	layout.closeMenu()

	const toPathname = to?.url.pathname

	if (toPathname) {

		const toHref		= to?.url.href
		const fromHref		= from?.url.href
		const fromPathname	= from?.url.pathname
		const noExemption	= !routes.same('home', toPathname) && !routes.same('account', toPathname) && !routes.same('producer-orders', toPathname) && !routes.same('search', toPathname) && !routes.same('producer', toPathname) && !routes.same('checkout', toPathname)

		if (noExemption && toHref == fromHref) cancel()
		else {

			const formPage		= routes.same('product-create', fromPathname) || routes.same('product-edit', fromPathname) || routes.same('application-product-create', fromPathname) || routes.same('application-product-edit', fromPathname)
			
			if		(routes.same('home', toPathname)) search.check()
			else if	(formPage && modal.get('formChange')) {

				modal.set({formChange: true})

				cancel()
		
				const backAlert = {
					type	: 'warning',
					message	: "You have unsaved changes. If you leave without saving you'll lose all your work. This cannot be undone.",
				}
				
				const alertPromise = new Promise((resolve) => modal.open('alert', {alert:{...backAlert, resolve}}))

				alertPromise.then(() => {
					
					modal.set({formChange: false})

					goto(toPathname)
				})
			}

			header.set({backButton:null})

			routes.accountType(toPathname, cancel)
		}
	}
}