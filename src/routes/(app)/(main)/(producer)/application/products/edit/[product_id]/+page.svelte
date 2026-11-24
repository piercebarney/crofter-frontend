<script lang="ts">

	import type { PageData } from './$types'

	import ProducerApplicationProductsEdit from 'src/features/groups/company/producer/pages/application/products/pages/edit.svelte'



	export let data: PageData

</script>



<ProducerApplicationProductsEdit product={data.product} />