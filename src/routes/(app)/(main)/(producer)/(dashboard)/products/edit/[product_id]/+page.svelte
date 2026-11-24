<script lang="ts">

	import type { PageData } from './$types'

	import ProducerProductEdit from 'src/features/groups/company/producer/pages/products/pages/edit.svelte'



	export let data: PageData

</script>



<ProducerProductEdit product={data.product} />