<script lang="ts">

	import type { PageData } from './$types'

	import ProducerFulfillmentPage from 'src/features/groups/company/producer/pages/fulfillment/page.svelte'



	export let data: PageData

</script>



<ProducerFulfillmentPage orderId={data.orderId} />