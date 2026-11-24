<script lang="ts">

	import type { LayoutData } from './$types'

	import MainLayout from 'src/features/layouts/main.svelte'

	

	export let data: LayoutData

</script>


<div class="pico-scope" style="display:contents">

	<MainLayout authRedirect={data?.authRedirect}>

		<slot />
		
	</MainLayout>

</div>