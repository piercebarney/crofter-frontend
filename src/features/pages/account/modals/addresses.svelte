<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Addresses from 'src/features/partials/addresses.svelte'



	export let modal: any

	const singular	= $modal?.data?.singular ? $modal.data.singular : false
	const label		= $modal?.data?.companyId ? ($modal.data.companyRole == 'distributor' ? 'Locations and Hours' : singular ? 'Physical Address' : 'Physical Addresses') : 'Billing Address'

</script>



<Container {label} {modal}>

	<Addresses {modal} />

</Container>