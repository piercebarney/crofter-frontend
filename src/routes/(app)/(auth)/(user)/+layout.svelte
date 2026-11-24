<script lang="ts">

	// Import a more specific type instead of relying on auto-generated types
	import type { LayoutData } from './$types'

	import Layout from 'src/features/groups/auth/layouts/auth.svelte'



	export let data: LayoutData

</script>



<Layout authRedirect={data?.authRedirect}>

	<slot />

</Layout>