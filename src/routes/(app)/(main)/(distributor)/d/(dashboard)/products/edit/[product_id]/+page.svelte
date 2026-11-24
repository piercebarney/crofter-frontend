<script lang="ts">

	import type { PageData } from './$types'

	import DistributorProductEdit from 'src/features/groups/company/distributor/pages/products/pages/edit.svelte'



	export let data: PageData

</script>



<DistributorProductEdit product={data.product} />