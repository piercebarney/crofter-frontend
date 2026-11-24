<script lang="ts">

	import type { LayoutData } from './$types'

	import AppLayout from 'src/features/layouts/app/layout.svelte'



	export let data: LayoutData

</script>



<AppLayout user={data.user} locations={data.locations} skus={data.skus} layoutErrors={data.layoutErrors}>

	<slot />

</AppLayout>