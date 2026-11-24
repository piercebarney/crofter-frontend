<script lang="ts">

	import type { PageData } from './$types'

	import Orders from 'src/features/groups/consumer/pages/orders/page.svelte'



	export let data: PageData

</script>



<Orders {...data} />