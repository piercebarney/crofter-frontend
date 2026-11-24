<script lang="ts">

	import type { User } from 'src/types/user'

	import { PUBLIC_TITLE } from '$env/static/public'
	import { browser } from '$app/environment'
	import { beforeNavigate, afterNavigate, goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { account } from 'src/features/pages/account/store'
	import { nav } from 'src/lib/nav'
	import { user as u } from 'src/stores/user'
	import { layout as l } from 'src/stores/layout'
	import { meta } from 'src/stores/meta'
	import { routes } from 'src/lists/routes'
	import MainLayout from 'src/components/layouts/main.svelte'
	import Cart from 'src/features/groups/consumer/modules/cart/module.svelte'


	
	export let user: User

	if		(user.id == null)	u.clear()
	else if	(!$u.id)			u.set(user)

	beforeNavigate(async ({ to, from, cancel }) => nav(to, from, cancel))

	// Reset scroll to top after navigation when pathname changes
	afterNavigate(({ from, to }) => {

		if (browser && from?.url.pathname !== to?.url.pathname) {

			const scrollElement = l.get('scroll').element

			if (scrollElement) {

				// Temporarily disable smooth scrolling
				scrollElement.style.scrollBehavior = 'auto'
				scrollElement.scrollTo({ top: 0, behavior: 'auto' })

				// Restore smooth scrolling after a brief delay
				setTimeout(() => scrollElement.style.scrollBehavior = 'smooth', 50)
			}
		}
	})

	const metaValues = {title : `${routes.title($page.url.pathname)} - ${PUBLIC_TITLE}`}

	const { type } = $account.active

	if (type == 'producer' && user.companies.length > 0) {

		for (const company of user.companies) {
			
			if (company.role == 'PRODUCER' && company.ziftAccountId == null) goto(routes.pathname('application'))
		}
	}

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html meta.make(metaValues)}

</svelte:head>

<MainLayout>

	<slot />

	<Cart slot="cart" />

</MainLayout>
