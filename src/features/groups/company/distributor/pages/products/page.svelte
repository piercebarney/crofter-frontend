<script lang="ts">

	// import type { ProducerProductCard } from 'src/types/product'

	import { browser } from '$app/environment'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import { skus as s } from 'src/stores/skus'
	// import { pickUpLocations } from 'src/stores/pickUpLocations'
	import { fulfillments as f } from 'src/lists/fulfillments'
	// import PageHeader from 'src/features/groups/company/partials/page-header.svelte'
	import A from 'src/components/elements/a.svelte'
	// import Icon from 'src/components/elements/icon/element.svelte'
	import Img from 'src/components/elements/img.svelte'



	export let application: boolean = false

	const sortLocationId = null
	
	// let initialized:	boolean						= false,
	let	company:		any							= null,
		products:		any	= null
		// sortLocationId:	string|null					= null

	$: companyProducts	= $company?.products
	$: searchTerm		= $search.term
	$: searchInput		= $search.input
	$: searchSearching	= $search.searching
	$: searchActive		= $search.active
	$: searchResults	= $search.results
	$: isMobile			= $layout.isMobile

	const fetch = () => company.productsFetch(sortLocationId)

	// const filterByLocation = (e: Event) => {

	// 	const target = e.target as HTMLSelectElement

	// 	sortLocationId = target.value == 'all' ? null : target.value

	// 	if (searchActive)	search.do()
	// 	else				fetch()

	// 	search.setSortLocationId(sortLocationId)

	// 	layout.scroll(0, 'smooth')
	// }

	$: browser && !company && $c && (() => {

		company = c.get($account.active.id)

		if (company) {

			fetch()

			// initialized = true
		}
	})()

	$: if	(searchTerm && !searchInput && !searchSearching && searchActive)	products = searchResults
	else if	(companyProducts)													products = companyProducts

</script>



{#if products}

	{#if isMobile}

		<!-- <PageHeader>

			<div slot="left">
				<select on:change={filterByLocation}>
					<option value="all" selected>All</option>
		
					{#each $pickUpLocations as location}
		
						<option value={location.id}>{location.title}</option>
		
					{/each}
		
				</select>
			</div>

		</PageHeader> -->

		<div class="products-wrapper-mobile container list">

			{#if products.length > 0}
					
				<!-- {#each products as {active, company, id, image, price, title, unit} (id)} -->

				{#each products as {company, forDelivery, forPickUp, forDistribution, id, image, title, variants} (id)}

					{@const variant = variants[0]}
					{@const active = s.getByVariantId(variant.id)?.active}

					{@const fulfillment = ['delivery', 'pickup', 'distribution']
						.filter(name => ({delivery: forDelivery, pickup: forPickUp, distribution: forDistribution})[name])
						.map(name => f.get('name', name)?.title)
						.join(', ')}

					<A route="{application ? 'application-' : 'distributor-'}product-edit" values={{path:{id}}} c="cm-list-item" wrapper>

						<div class="product-wrapper {active ? undefined : 'inactive'}">
							<div class="image-title-status-wrapper">
								<div class="image">

									<Img src={image} square="4rem" />

								</div>
								<div class="title-price-wrapper">
									<span class="title">{title}</span>
									<span class="company">{company.name}</span>
									<span>{variant.price.string}/{variant.unit.toLowerCase()}</span>
								</div>
								<div class="activity-fulfillment-wrapper">

									{#if active}

										<span class="active">Published</span>

									{:else}

										<span class="inactive">Inactive</span>

									{/if}

									<span class="fulfillment">{fulfillment}</span>
								</div>
							</div>
						</div>

					</A>
				
				{/each}

			<!-- {:else}

				<div class="empty">

					<A route="product-create" inverse application>Add Your First Product</A><br>

				</div> -->

			{/if}

		</div>
		<!-- <div class="add-button-mobile">

			{#if application}

				<A route="application-product-create" button square application>

					<Icon name="plus" />

				</A>

			{:else}

				<A route="product-create" button square>

					<Icon name="plus" />

				</A>

			{/if}

		</div> -->
		
	{:else}

		<!-- <PageHeader>

			<div slot="left">
				<select id="filter-by-location" on:change={filterByLocation}>
					<option value="all" selected>All</option>
		
					{#each $pickUpLocations as location}
		
						<option value={location.id}>{location.title}</option>
		
					{/each}
		
				</select>
			</div>

		</PageHeader> -->

		<div class="products-wrapper container">

			{#if products.length > 0}
				
				<table>
					<tbody>
						<tr style="display:contents">	
							<td style="display:contents"></td>
						</tr>

						{#each products as {company, forDelivery, forPickUp, forDistribution, id, image, title, variants} (id)}

							{@const variant = variants[0]}
							{@const active = s.getByVariantId(variant.id)?.active}

							{@const fulfillment = ['delivery', 'pickup', 'distribution']
								.filter(name => ({delivery: forDelivery, pickup: forPickUp, distribution: forDistribution})[name])
								.map(name => f.get('name', name)?.title)
								.join(', ')}

							<A route="{application ? 'application-' : 'distributor-'}product-edit" values={{path:{id}}} c={active ? undefined : 'inactive'} tr>

								<td width="1%">
									
									<Img src={image} square="3.75rem" />

								</td>
								<td>
									<div class="names">
										<span>{title}</span>
										<span>{company.name}</span>
									</div>
								</td>
								<td>
									<span>{variant.price.string}/{variant.unit.toLowerCase()}</span>
								</td>
								<td>
									<span>{fulfillment}</span>
								</td>
								<td width="1%">

									{#if active}

										{#if application}

											<span class="active">Publish Pending</span>

										{:else}

											<span class="active">Published</span>

										{/if}

									{:else}

										<span class="inactive">Inactive</span>

									{/if}

								</td>

							</A>

						{/each}

					</tbody>
				</table>

			{:else}

				<div class="empty">

					{#if $search.active}

						<span>No Products Found</span>

					{:else}
					
						{#if application}

							<A route="application-product-create" inverse application>Add Your First Product</A>

						{:else}
						
							<A route="product-create" inverse application>Add Your First Product</A>

						{/if}

					{/if}

				</div>

			{/if}

		</div>

	{/if}

{:else}

		<div class="empty">Loading...</div>

{/if}



<style lang="sass">

	// #filter-by-location
	// 	border-color: var(--cm-border)

	// 	&:hover
	// 		cursor: pointer

	.products-wrapper-mobile
		min-height: 100%
		padding-top: 2rem

	.empty
		padding-top: 2rem
		font-size: 1.5rem
		text-align: center

	.product-wrapper
		padding: .5rem
		@include flex-col(.5rem)

		// &.inactive
		// 	opacity: .5

		&:hover
			background-color: var(--cm-utility-highlight)

		.image-title-status-wrapper
			@include flex-row(.5rem)

			.image,
			.active,
			.inactive
				flex-grow: 0

			.title
				flex-grow: 0
				font-weight: 600

			.company
				color: var(--cm-text-secondary)
				font-size: .8rem

			.title-price-wrapper
				@include flex-col(.5rem)

			.activity-fulfillment-wrapper
				@include flex-col-right()

				.fulfillment
					font-size: .8rem

	// .add-button-mobile
	// 	@include fixed-bottom-left(1rem)

	.products-wrapper
		padding-top: 2.5rem
		padding-bottom: 2.5rem

		td
			vertical-align: middle

	// .active,
	// .inactive
	// 	padding: .5rem 1rem
	// 	border-radius: .5rem

	.active
		// background-color: var(--cm-background-money)
		color: var(--cm-text-money)

	// .inactive
		// background-color: var(--cm-form-background)
		// color: var(--cm-text-secondary-dark)

	.names
		@include flex-col(.5rem)

		span:last-child
			color: var(--cm-text-secondary)
			font-size: .8rem

</style>