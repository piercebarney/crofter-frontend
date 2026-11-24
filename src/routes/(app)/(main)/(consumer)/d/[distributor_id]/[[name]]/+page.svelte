<script lang="ts">

	import type { PageData } from './$types'

	import Distributor from 'src/features/groups/consumer/pages/distributor/page.svelte'
	


	export let data: PageData

</script>



<Distributor company={data.company} />