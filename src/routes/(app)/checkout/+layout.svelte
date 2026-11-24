<script lang="ts">

	import type { LayoutData } from './$types'

	import Layout from 'src/features/groups/consumer/layouts/checkout.svelte'



	export let data: LayoutData

</script>



<div class="pico-scope" style="display:contents">

	<Layout user={data.user}>

		<slot />

	</Layout>

</div>