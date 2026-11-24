<script lang="ts">

	import type { PageData } from './$types'

	import DistributorFulfillmentPage from 'src/features/groups/company/distributor/pages/fulfillment/page.svelte'



	export let data: PageData

</script>



<DistributorFulfillmentPage orderId={data.orderId} />