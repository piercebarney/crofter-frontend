<script lang="ts">

	import { browser } from '$app/environment'
	import { invalidateAll } from '$app/navigation'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { account } from 'src/features/pages/account/store'
	import { company } from 'src/stores/company/store'
	import { search } from 'src/features/groups/search/store'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { routes } from 'src/lists/routes'
	import ImageUpload from 'src/features/modules/image-upload/module.svelte'

	

	export let authRedirect: string|undefined

	let currentAccountType:	string|null = null

	if (browser) {
		
		if (authRedirect) invalidateAll()

		routes.accountType($page.url.pathname)
	}

	$: if (browser && $account.active.type != currentAccountType) {

		search.clear(false, false)

		currentAccountType = $account.active.type

		if ($account.active.isCompany) company.load($account.active.id)
	}

	// Initialize cart
	onMount(() => setTimeout(c.init, 100)) // 100 miliseconds

</script>



<slot />

<ImageUpload />