<script lang="ts">

	import { onMount } from 'svelte'
	import { skus as s } from 'src/stores/skus'
	import { layout as l } from 'src/stores/layout'
	import { gA4 } from 'src/lib/gA4'
	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Img from 'src/components/elements/img.svelte'
	// import Icon from 'src/components/elements/icon/element.svelte'
	import PriceUnit from 'src/components/units/product-cards/units/card/partials/price-unit.svelte'
	import Quantity from 'src/features/partials/quantity.svelte'
	import Rt from 'src/components/elements/rt.svelte'
	import LoaderBlock from 'src/components/loaders/block.svelte'
	import LoaderLines from 'src/components/loaders/lines.svelte'



	export let modal: any

	const isDelivery = false

	let skuId: string|null	= null,
		sku: any
		// isDelivery: boolean	= false

	$: isMobile	= $l.isMobile

	onMount(() => {

		skuId = $modal?.data?.skuId || null

		if (skuId) sku = s.getById(skuId)

		gA4.viewItem({skuId, sku})
	})

</script>



<Container label="Product Details" {modal} closeButton={false}>

	{#if sku}

		{@const variant = sku.variant}
		{@const product = variant.product}
		{@const company = product.company}

		{#if product?.image}

			<div class="image">

				<Img src={product.image} />

				{#if company?.image}

					<Button action={() => modal.open('producer', {companyId:company?.id, skuId})} role="wrapper" c="product-page-company-image" stopPropagation>
						
						<Img src={company.image} round="3.5rem" border="#fff" />

					</Button>

				{/if}

			</div>

		{/if}

		{#if isMobile}

			<div class="details-mobile{isDelivery ? ' right' : ''}">
				<div class="title-name">
					<span class="title">{product.title}</span>

					<Button action={() => modal.open('producer', {companyId:company?.id, skuId})} role="wrapper" stopPropagation>

						<span class="name">{company?.name}</span>
						
					</Button>

				</div>
				<div class="price-availability">

					<!-- {#if isDelivery}

						<div class="availability">
							<div>

								<Icon name="truck" />

								<span>Lead Time</span>
							</div>
							<span>{product.availability}</span>
						</div>
						<div></div>

					{/if} -->
					
					<div class="price-quantity">

						<PriceUnit price={variant.price} unit={variant.unit} />

						{#if sku.active}

							<div class="quantity">

								<Quantity {skuId} thin />
			
							</div>

						{/if}

					</div>
				</div>
			</div>

		{:else}

			<div class="details right">
				<div class="info">
					<div class="title-name">
						<span class="title">{product.title}</span>

						<Button action={() => modal.open('producer', {companyId:company?.id, skuId})} role="wrapper" stopPropagation>

							<span class="name">{company?.name}</span>

						</Button>

					</div>

					<!-- {#if isDelivery}

						<div class="availability">
							<div>

								<Icon name="truck" />

								<span>Lead Time</span>
							</div>
							<span>{product.availability}</span>
						</div>

					{/if} -->

				</div>
				<div></div>
				<div class="price-quantity">

					<PriceUnit price={variant.price} unit={variant.unit} />

					{#if sku.active}

						<div class="quantity">

							<Quantity {skuId} thin />
		
						</div>

					{/if}
					
				</div>
			</div>

		{/if}

		{#if product?.description}

			<div class="description">
				<span>Producer's Description</span>

				<Rt text={product.description} />

			</div>

		{/if}

	{:else}

		<div class="image loader">
			
			<LoaderBlock />
		
		</div>

		<LoaderLines />

	{/if}
	
</Container>



<style lang="sass">

	:global(.product-page-company-image)
		z-index: 1
		@include absolute-bottom-right(1rem)
	
	:global(.home-page-company-name)
		font-size: .8rem
		font-weight: 200
		font-style: italic
		color: var(--cm-text-secondary)

		&:hover
			color: var(--cm-primary-hover)

	:global(.details-mobile.right .price-unit-wrapper),
	:global(.details.right .price-unit-wrapper)
		justify-content: flex-end
		text-align: right

	.image
		margin: 0 -1rem
		position: relative
		overflow: hidden

		&.loader
			width: 100%
			aspect-ratio: 100/65

	.details-mobile
		@include flex-col(1rem)

		.price-availability
			@include flex-row-top

			> div
				flex: 1

			> div:first-child,
			> div:last-child
				flex: 4

	.details
		@include flex-row

		> div
			flex: 1

		> div:first-child
			flex: 5

		> div:last-child
			flex: 2

		.info
			@include flex-col(.5rem)

	.details-mobile.right .price-quantity,
	.details.right .price-quantity
		align-items: flex-end

	.title
		flex-grow: 0
		line-height: 1.2
		font-size: 1.2rem
		font-weight: 600

	.name
		font-size: .8rem
		color: var(--cm-text-secondary-dark)

		&:hover
			text-decoration: underline

	// .availability
		
	// 	> div
	// 		margin-bottom: .25rem
	// 		font-weight: 600
	// 		@include flex-row-middle(.25rem)

	.price-quantity
		@include flex-col(.25rem)

		.quantity
			flex-grow: 0
			width: fit-content
			@include flex-col-middle-right

	.description
		margin-top: 1rem

		> span
			display: inline-block
			margin-bottom: .5rem
			font-size: 1.2rem
			font-weight: 600


	@media (min-width: #{breakpoint('xs')})

		.details-mobile

			.price-availability

				> div:first-child,
				> div:last-child
					flex: 2
	

	@media (min-width: #{breakpoint('md')})

		:global(.product-page-company-image)
			@include absolute-bottom-right(1.5rem)

		.image
			margin: 0 -1.5rem

		.title
			font-size: 1.4rem

		.price-quantity
			gap: .5rem


	// @media (min-width: #{breakpoint('lg')})

	// 	.availability
	// 		font-size: .8rem


	@media (min-width: #{breakpoint('lg')})

		:global(.details.right .price-unit-wrapper)
			flex-direction: row

</style>