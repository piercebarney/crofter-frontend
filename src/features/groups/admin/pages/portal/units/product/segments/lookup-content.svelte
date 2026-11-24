<script lang="ts">

	import type { ProductData, ProductObject } from 'src/features/groups/admin/pages/portal/types'

	import { fulfillmentList } from 'src/lists/fulfillments'
	import SectionContent from 'src/features/groups/admin/pages/portal/wrappers/section-content.svelte'
	import InputGroup from 'src/features/groups/admin/pages/portal/wrappers/input-group.svelte'
	import Lookup from 'src/features/groups/admin/pages/portal/wrappers/lookup.svelte'
	import ProductCard from 'src/features/groups/admin/pages/portal/units/product/partials/product-card.svelte'
	import UpdateGroup from 'src/features/groups/admin/pages/portal/wrappers/update-group.svelte'



	export let product: ProductObject
	export let productData: ProductData|null
	export let active: boolean					= false

	$: fulfillmentValues = {delivery:productData?.forDelivery ?? false, distribution:productData?.forDistribution ?? false, pickup:productData?.forPickUp ?? false}

</script>


<SectionContent section="product" name="lookup" active={active}>

	<InputGroup slot="controls">

		<input type="text" placeholder="Search" bind:value={product.searchTerm} />
		<button on:click={() => product.search('productId')} disabled={product.searchTerm == ''}>by ID</button>
		<button on:click={() => product.search('clear')} disabled={productData == null && product.searchTerm == ''}>Clear</button>

	</InputGroup>

	{#if productData}

		<Lookup>

			<ProductCard {productData} productFetch={product.fetch} lookup />

			<UpdateGroup>

				<span>Active</span>
				<div class="checkbox-group">
					<input type="checkbox" checked={productData.active} on:change={(e) => product.update('active', {active:e.currentTarget.checked})} />
				</div>

			</UpdateGroup>

			<UpdateGroup>

				<span>Fulfillment</span>
				<div class="checkbox-group">

					{#each fulfillmentList as fulfillment (fulfillment)}

						{@const checked = fulfillmentValues[fulfillment.name as keyof typeof fulfillmentValues]}

						<input type="checkbox" value={fulfillment.name} {checked} on:change={(e) => product.update('fulfillment', {fulfillment:fulfillment.name, productId:productData?.id, checked:e.currentTarget.checked})} /> {fulfillment.description}

					{/each}

				</div>

			</UpdateGroup>

			{#if product.distributors && product.distributors.length > 0}

				<UpdateGroup>

					<span>Distributors</span>
					<div class="checkbox-group">

						{#each product.distributors as distributor (distributor)}

							{@const checked = productData?.distributors?.some(d => d.id === distributor.id) ?? false}

							<input type="checkbox" value={distributor.id} {checked} on:change={(e) => product.update('distributor', {distributorId:distributor.id, productId:productData?.id, checked:e.currentTarget.checked})} /> {distributor.name}
							
						{/each}
						
					</div>
			
				</UpdateGroup>

			{/if}

			{#if product.distributorLocations && product.distributorLocations.length > 0}

				<UpdateGroup>

					<span>Distribution Locations</span>
					<div class="checkbox-group">

						{#each product.distributorLocations as location (location)}

							{@const checked = productData?.distributorLocations?.some(d => d.id === location.id) ?? false}

							<input type="checkbox" value={location.id} {checked} on:change={(e) => product.update('distributorLocation', {addressId:location.id, productId:productData?.id, checked:e.currentTarget.checked})} /> {location.city}
							
						{/each}
						
					</div>
				
				</UpdateGroup>

			{/if}

			<UpdateGroup>

				<button class="danger" on:click={() => product.update('delete')}>Delete</button>
	
			</UpdateGroup>

		</Lookup>

	{/if}

</SectionContent>
