<script lang="ts">

	import { PUBLIC_TITLE } from '$env/static/public'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { meta } from 'src/stores/meta'
	import { routes } from 'src/lists/routes'
	import CenteredLayout from 'src/components/layouts/centered.svelte'
	import Modal from 'src/features/modules/modal/module.svelte'



	export let authRedirect: string|undefined

	if	(browser) {
		
		if	(authRedirect)	goto(authRedirect)
		else				invalidateAll()

		routes.accountType($page.url.pathname)
	}

	const metaValues = {title : `${routes.title($page.url.pathname)} - ${PUBLIC_TITLE}`}

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html meta.make(metaValues)}

</svelte:head>



<CenteredLayout>

	<slot />

	<Modal slot="modal" />

</CenteredLayout>