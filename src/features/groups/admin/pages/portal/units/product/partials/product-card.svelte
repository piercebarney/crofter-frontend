<script lang="ts">

	import type { ProductData, ProductFetch } from 'src/features/groups/admin/pages/portal/types'

	// import { formatDateTime } from 'src/lib/helpers'
	import Card from 'src/features/groups/admin/pages/portal/wrappers/card.svelte'
	import DataSet from 'src/features/groups/admin/pages/portal/partials/data-set.svelte'



	export let productData:		ProductData
	export let productFetch:	ProductFetch
	export let lookup:			boolean			= false

	$: productId			= productData.id
	$: title				= productData.title
	$: active				= productData.active ? 'Yes' : 'No'
	$: priceUnit			= `${productData.price.asString}/${productData.unit}`
	$: fulfillments			= [productData.forDelivery ? 'Delivery' : '', productData.forDistribution ? 'Distribution' : '', productData.forPickUp ? 'Pick Up' : ''].filter(Boolean).join(', ') || 'None'
	$: availability			= productData.availability
	$: distributors			= productData?.distributors?.length > 0 ? productData.distributors.map(distributor => distributor.name).join(', ') : 'None'
	$: distributorLocations	= productData?.distributorLocations?.length > 0 ? productData.distributorLocations.map(location => location.city).join(', ') : 'None'

</script>

<Card>

	<svelte:fragment slot="head">

		<span class="head-title">{title}</span>

		<DataSet label="Active" value={active} />

	</svelte:fragment>

	<svelte:fragment slot="body-first">

		<DataSet label="Price/Unit" value={priceUnit} />

		<DataSet label="Fulfillment" value={fulfillments} />

		<DataSet label="Availability" value={availability} />

	</svelte:fragment>
	
	<svelte:fragment slot="body-second">

		<DataSet label="Distributors" value={distributors} />

		<DataSet label="Distributor Locations" value={distributorLocations} />

	</svelte:fragment>

	<svelte:fragment slot="foot">
	
		{#if lookup}

			<span>{productId}</span>
		
		{:else}

			<button role="link" on:click={() => productFetch({productId})}>{productId}</button>
		
		{/if}

		<!-- <DataSet label="Created" value={formatDateTime(product.insertedAt, {time:false})} /> -->
		
	</svelte:fragment>

</Card>