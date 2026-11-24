<script lang="ts">

	import type { LayoutData } from './$types'

	import ConsumerLayout from 'src/features/groups/consumer/layouts/consumer/layout.svelte'
	


	export let data: LayoutData

</script>



<ConsumerLayout user={data.user}>

	<slot />

</ConsumerLayout>