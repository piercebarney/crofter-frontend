<script lang="ts">

	import type { User } from 'src/types/user'

	import { PUBLIC_TITLE } from '$env/static/public'
	import { beforeNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import { nav } from 'src/lib/nav'
	import { user as u } from 'src/stores/user'
	import { meta } from 'src/stores/meta'
	import { routes } from 'src/lists/routes'



	export let user: User

	if		(user.id == null)	u.clear()
	else if	(!$u.id)			u.set(user)

	beforeNavigate(async ({ to, from, cancel }) => nav(to, from, cancel))

	const metaValues = {title : `${routes.title($page.url.pathname)} - ${PUBLIC_TITLE}`}

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html meta.make(metaValues)}

</svelte:head>

<slot />