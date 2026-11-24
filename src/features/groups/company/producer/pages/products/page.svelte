<script lang="ts">

	// import type { ProducerProductCard } from 'src/types/product'

	import { browser } from '$app/environment'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	// import { fulfillments as f } from 'src/lists/fulfillments'
	import PageHeader from 'src/features/groups/company/partials/page-header.svelte'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Img from 'src/components/elements/img.svelte'



	export let application: boolean = false
	
	let company: any			= null,
		products: any[]|null	= null,
		init: boolean			= true

	$: if (browser && company == null && $c) company = c.get($account.active.id)

	$: if (init && company) {

		init = false

		company.productsFetch()
	}

	$: if	($search.term && $search.searching == false && $search.active == true)	products	= $search.results
	else if	($company?.products)													products	= $company.products

	$: isMobile	= $layout.isMobile

</script>



{#if products}

	{#if isMobile}

		<div class="products-wrapper-mobile container list">

			{#if products.length > 0}
					
				{#each products as {id, image, variants, title} (id)}

					<!-- {@const isNotDistributed = distributors.length == 0} -->

					<!-- {@const fulfillment = ['delivery', 'pickup', 'distribution']
						.filter(name => ({delivery: forDelivery, pickup: forPickUp, distribution: forDistribution})[name])
						.map(name => f.get('name', name)?.description)
						.join(', ')} -->

					<!-- {#if isNotDistributed} -->

						<A route="{application ? 'application-' : ''}product-edit" values={{path:{id}}} c="cm-list-item" wrapper>

							<div class="product-wrapper">
								<div class="image-title-status-wrapper">
									<div class="image">

										<Img src={image} square="4rem" />

									</div>
									<div class="title-price-wrapper">
										<span class="title">{title}</span>
										<span>{variants[0].price.string}/{variants[0].unit.toLowerCase()}</span>
									</div>
								</div>
							</div>

						</A>

					<!-- {/if} -->
				
				{/each}

			{:else}

				<div class="empty">

					<A route="{application ? 'application-' : ''}product-create" inverse application>Add Your First Product</A><br>

				</div>

			{/if}

		</div>
		<div class="add-button-mobile">

			{#if application}

				<A route="application-product-create" button square application>

					<Icon name="plus" />

				</A>

			{:else}

				<A route="product-create" button square>

					<Icon name="plus" />

				</A>

			{/if}

		</div>
		
	{:else}

		<PageHeader>

			<div slot="right">

				{#if application}

					<A route="application-product-create" button application>Add Product</A>

				{:else}

					<A route="product-create" button>Add Product</A>

				{/if}

			</div>

		</PageHeader>

		<div class="products-wrapper container">

			{#if products.length > 0}
				
				<table>
					<tbody>
						<tr style="display:contents">	
							<td style="display:contents"></td>
						</tr>

						{#each products as {id, image, title, variants} (id)}

							<!-- {@const isNotDistributed = distributors.length == 0} -->

							<!-- {@const fulfillment = ['delivery', 'pickup', 'distribution']
								.filter(name => ({delivery: forDelivery, pickup: forPickUp, distribution: forDistribution})[name])
								.map(name => f.get('name', name)?.description)
								.join(', ')} -->

							<!-- {#if isNotDistributed} -->

								<A route="{application ? 'application-' : ''}product-edit" values={{path:{id}}} tr>

									<td width="1%">
										
										<Img src={image} square="3.75rem" />

									</td>
									<td>
										<span>{title}</span>
									</td>
									<td>
										<span>{variants[0].price.string}/{variants[0].unit.toLowerCase()}</span>
									</td>

								</A>

							<!-- {/if} -->

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
				font-weight: 600

			.title-price-wrapper
				@include flex-col(.5rem)

			// .title,
			// .active,
			// .inactive
			// 	padding: .5rem 0

	.add-button-mobile
		@include fixed-bottom-left(1rem)

	.products-wrapper
		padding-top: 2.5rem
		padding-bottom: 2.5rem

		table

			tbody

				tr:last-child

					td
						border-color: transparent

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

</style>