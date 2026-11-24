<script lang="ts">

	import type { User } from 'src/types/user'

	import { reporter } from 'src/lib/reporter/module'
	import { PUBLIC_TITLE } from '$env/static/public'
	import { afterNavigate } from '$app/navigation'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page as p } from '$app/stores'
	import { user as u } from 'src/stores/user'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { meta as m } from 'src/stores/meta'
	import { routes as r } from 'src/lists/routes'
	import MainLayout from 'src/components/layouts/main.svelte'
	


	export let user: User

	if	(user.id == null)	u.clear()
	else					u.set(user)

	$: checkout			= r.same('checkout', $p.url.pathname)
	$: cartInitialized	= $c.initialized
	$: cartCheckout		= $c.checkout
	$: cartCount		= $c.count

	$: if (browser && cartInitialized && !cartCheckout && cartCount == 0) goto(r.consumerDefaultPathname)

	const metaValues = {title : `${r.title($p.url.pathname)} - ${PUBLIC_TITLE}`}

	afterNavigate((navigation) => {
		
		if (navigation.type === 'goto') return
		else if (navigation.type === 'enter') {

			if ($p.url.searchParams.get('sso') !== 'true') goto(r.consumerDefaultPathname)
			
			// Safety timeout: refresh page if cart initialization hangs
			const safetyTimeout = setTimeout(() => {

				console.warn('Cart initialization timeout - refreshing page')

				const reportError = reporter({type:'error', file:'/src/features/groups/consumer/layouts/checkout.svelte'})

				reportError({
					message		: 'Cart initialization timeout - refreshing page',
					args		: {
						checkout		: $c.checkout,
						count			: $c.count,
						initialized		: $c.initialized
					},
					location	: 'afterNavigate',
					raw			: {
						userAgent		: navigator.userAgent,
						online			: navigator.onLine,
						cookieEnabled	: navigator.cookieEnabled
					}
				})

				window.location.reload()

			}, 3 * 1000) // 3 seconds
			
			setTimeout(async () => {
			
				c.init()

				await c.whenSynchronized()

				c.setCheckout(true)
				
				// Clear safety timeout if we successfully complete
				clearTimeout(safetyTimeout)
				
			}, 100)

		} else c.setCheckout(true)
	})

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html m.make(metaValues)}

</svelte:head>



<MainLayout {checkout}>

	<slot />

</MainLayout>