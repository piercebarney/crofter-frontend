<script lang="ts">

	import { fade as fader } from 'svelte/transition'
	import Img from 'src/components/elements/img.svelte'
	import PriceUnit from 'src/components/units/product-cards/units/card/partials/price-unit.svelte'
	import Quantity from 'src/features/partials/quantity.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let sku: any									= null
	export let fade: boolean							= false
	export let loader: boolean							= false

	const delay 		= 0,
		duration	= fade ? 500 : 0

</script>



{#if loader}

	<div class="product-link-wrapper">
		<div class="top">
			<div class="image">
				<div class="product-image">
					<div class="loading-placeholder"></div>
				</div>
			</div>
		</div>
		<div class="bottom">
			<div class="loading-placeholder bar"></div>
			<div class="loading-placeholder bar"></div>
			<div class="loading-placeholder block"></div>
		</div>
	</div>

{:else if sku}

	<Button modal="product" data={{skuId:sku.id}} c="product-link-wrapper" wrapper>

		{@const variant = sku.variant}
		{@const product = variant.product}
		{@const company = product.company}

		<div class="top" in:fader={{delay, duration}}>
			<div class="image">
				<div class="product-image">

					<Img src={product.image} lazy />

				</div>

				{#if company.image}

					<Button modal="producer" data={{companyId:company.id, skuId:sku.id}} role="wrapper" c="home-page-company-image" stopPropagation>
						
						<Img src={company.image} round="2.5rem" border="#fff" />

					</Button>

				{/if}

			</div>
			<div class="title-name">
				<span class="title">{product.title}</span>

				<Button modal="producer" data={{companyId: company.id}} role="wrapper" stopPropagation>

					<span class="name">{company.name}</span>

				</Button>

			</div>
		</div>
		<div class="bottom">

			<div class="price-add">

				<PriceUnit price={variant.price} unit={variant.unit} />

				<div>

					<Quantity skuId={sku.id} thin />
					
				</div>
			</div>
			
		</div>

	</Button>

{/if}



<style lang="sass">

	:global(.product-link-wrapper)
		border: 1px solid var(--cm-border) !important
		border-radius: var(--pico-border-radius)
		@include fill
		@include flex-col-between(1rem)

		.top
			@include flex-col(.5rem)

			.image
				position: relative
				max-height: 0
				width: 100%
				padding-top: 80%
				overflow: hidden
				border-radius: var(--pico-border-radius) var(--pico-border-radius) 0 0

				.product-image				
					z-index: 0
					@include absolute

			.title-name
				padding: 0 .5rem
				line-height: 1.3

				> span
					display: block

				.title
					font-weight: 600
					overflow: hidden
					text-overflow: ellipsis
					white-space: nowrap

				.name
					font-size: .8em
					color: var(--cm-text-secondary-dark)

					&:hover
						text-decoration: underline

		.bottom
			padding: .5rem
			@include flex-col-bottom(.5rem)

			.price-add
				width: 100%
				flex-wrap: wrap
				@include flex-col(.5rem)
				

	:global(.home-page-company-image)
		z-index: 1
		@include absolute-bottom-right(.5rem)


	@media (min-width: #{breakpoint('sm')})

		:global(.product-link-wrapper) 
			
			.bottom

				.price-add
					@include flex-col-left(.5rem)

	@media (min-width: #{breakpoint('md')})

		:global(.product-link-wrapper) 

			.bottom

				.price-add
					flex-wrap: nowrap
					@include flex-row-middle-between(.5rem)

	
	@media (min-width: #{breakpoint('lg')})

		:global(.product-link-wrapper)

			.bottom

				.price-add
					@include flex-col-left(.5rem)


	@media (min-width: #{breakpoint('xl')})

		:global(.product-link-wrapper)

			.bottom

				.price-add
					flex-wrap: nowrap
					@include flex-row-middle-between(.5rem)

</style>