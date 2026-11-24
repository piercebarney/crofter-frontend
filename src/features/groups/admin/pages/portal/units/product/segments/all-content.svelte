<script lang="ts">

	import type { ProductObject, ProductData } from 'src/features/groups/admin/pages/portal/types'

	import SectionContent from 'src/features/groups/admin/pages/portal/wrappers/section-content.svelte'
	import InputGroup from 'src/features/groups/admin/pages/portal/wrappers/input-group.svelte'
	import Count from 'src/features/groups/admin/pages/portal/partials/count.svelte'
	import ProductCards from 'src/features/groups/admin/pages/portal/units/product/partials/product-cards.svelte'



	export let product:			ProductObject
	export let productsData:	ProductData[]|null
	export let active:			boolean				= false

	$: productFetch = product.fetch

</script>



<SectionContent section="product" name="all" active={active}>

	<InputGroup slot="controls">

		<input type="text" placeholder="Search" bind:value={product.fetchAllTerm} />
		<button on:click={() => product.fetchAll('id')} disabled={product.fetchAllTerm == ''}>by ID</button>
		<button on:click={() => product.fetchAll('email')} disabled={product.fetchAllTerm == ''}>by Email</button>
		<button on:click={() => product.fetchAll('phoneNumber')} disabled={product.fetchAllTerm == ''}>by Phone</button>
		<button on:click={() => product.fetchAll('clear')} disabled={productsData == null && product.fetchAllTerm == ''}>Clear</button>

	</InputGroup>

	<Count data={productsData} filteredCount={product.filteredCount} slot="count" />
	
	{#if productsData}

		<ProductCards {productsData} {productFetch} />

	{/if}

</SectionContent>