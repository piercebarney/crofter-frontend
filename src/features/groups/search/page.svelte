<!-- <script lang="ts">

	import type { ProductCardV1 } from 'src/types/product'

	import { PUBLIC_TITLE } from '$env/static/public'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { search } from 'src/features/groups/search/store'
	import { meta } from 'src/stores/meta'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import Wave from 'src/features/groups/consumer/pages/wrapper.svelte'
	import FulfillmentFilter from 'src/features/groups/search/units/fulfillment-filter/unit.svelte'
	import Label from 'src/components/elements/label.svelte'
	import ProductCards from 'src/components/units/product-cards-v1/unit.svelte'


	
	export let products: Record<string,ProductCardV1[]>

	let fulfillment:	string|null	= null
		// nearbyLabel:		string		= 'Nearby'

	$: $search.fulfillment ? fulfillment = f.get('name', $search.fulfillment)?.filter : fulfillment = null

	$: metaValues = {
		title	: `${$search.term.toLowerCase()} - ${PUBLIC_TITLE}`,
		url		: $page.url.href
	}

	// $: if (fulfillment)	nearbyLabel = `Nearby for ${fT.get('filter', fulfillment)?.description}`
	// else					nearbyLabel	= 'Nearby'

	$: if (metaValues) meta.set(metaValues)

	onMount(() => {

		let tm	= $page.params.encoded,
			zc	= $page.url.searchParams.get('z') || $page.url.searchParams.get('zc'),
			ft	= $page.url.searchParams.get('f') || $page.url.searchParams.get('ft'),
			pr	= parseInt($page.url.searchParams.get('p') || $page.url.searchParams.get('pr') as string)

		if (tm && !$search.term) search.set({term:tm, active:true})
		if (zc && !$search.zipCode) {
			
			if	(zc.length != 5 || !/^\d+$/.test(zc))	zc = null
			else										search.set({enteredZipCode:zc})
		}
		if (ft && !$search.fulfillment) search.set({fulfillment:ft})
		if (!$search.proximity) {
			
			if	(pr)	search.set({proximity:pr})
			// else		search.set({proximity:50})
		}
	})

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html $meta.tags.join('')}

	<link rel="canonical" href={metaValues.url}>

</svelte:head>



<div class="page-wrapper">

	<Wave top={true} />

	<div>
		<div class="search-filter-wrapper container">
			<div>

				<FulfillmentFilter />

			</div>
		</div>

		{#if $search.searching}

			<div class="container">

				<ProductCards loader />

			</div>	
			
		{:else if products.nearby.length > 0 || products.delivery.length > 0}

			<div class="container label">
				
				<Label margin={false} big>Search Results</Label>

			</div>

			{#if products.nearby.length > 0}

				<div class="container">

					<ProductCards products={products.nearby} fade />

				</div>

			{/if}

			{#if products.delivery.length > 0}

				<div class="container">

					<ProductCards label="Available for Delivery" products={products.delivery} fade />

				</div>

			{/if}

		{:else}

			<div class="container label">
					
				<Label margin={false} big>Search Results</Label>

			</div>

			<span class="empty container">No Products Found</span>

		{/if}

	</div>

</div>



<style lang="sass">

	.page-wrapper
		@include flex-col(2rem)

		> div
			z-index: 10			
			padding-bottom: 6rem
			@include flex-col(4rem)

			.search-filter-wrapper
				position: relative
				margin-bottom: -1rem

				> div
					top: 0
					right: 1rem
					@include absolute-right

			.empty
				margin-top: 4.5rem
				text-align: center
				font-size: 2rem

			.label
				margin-bottom: -2rem

	@media (min-width: #{breakpoint('sm')})

		.page-wrapper

			> div

				.search-filter-wrapper
					margin-bottom: -4rem

	@media (min-width: #{breakpoint('md')})

		.page-wrapper
			gap: 3rem

			> div
				gap: 6rem

				.search-filter-wrapper
					margin-bottom: -6rem

				.label
					margin-bottom: -4rem

</style> -->