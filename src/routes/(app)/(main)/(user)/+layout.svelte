<script lang="ts">

	import type { LayoutData } from './$types'

	import Layout from 'src/features/layouts/user.svelte'


	
	export let data: LayoutData

</script>



<Layout user={data.user}>

	<slot />

</Layout>