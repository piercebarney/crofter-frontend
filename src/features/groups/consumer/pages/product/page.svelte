<script lang="ts">

	import type { Product } from 'src/types/product'
	import type { Company_Product } from 'src/types/company'
	// import type { ProductCard } from 'src/types/product'

	import { page } from '$app/stores'
	import { PUBLIC_TITLE } from '$env/static/public'
	import { browser } from '$app/environment'
	import { meta } from 'src/stores/meta'
	import { layout } from 'src/stores/layout'
	import Img from 'src/components/elements/img.svelte'
	// import Quantity from 'src/features/partials/quantity.svelte'
	// import Fulfillment from 'src/features/groups/consumer/pages/product/partials/fulfillment.svelte'
	import Label from 'src/components/elements/label.svelte'
	import Rt from 'src/components/elements/rt.svelte'
	import Button from 'src/components/elements/button.svelte' // v1 pause



	export let product: Product

	let company:			Company_Product|undefined	= product.company,
		// fulfillment:	string|null					= null,
		description:		string						= product.description ? product.description.replaceAll(/<\/?[^>]+(>|$)/g, '').replaceAll(/\r|\n|\t/g, ' ').replaceAll(/[ ]{2,}/g, ' ') : ''

	if (description.length > 160) description = `${description.substring(0,157)}...`

	let metaValues = {
		description,
		image		: [product.image],
		title		: `${product.title} - ${PUBLIC_TITLE}`,
		url			: $page.url.href
	}

	$: isMobile = $layout.isMobile

	$: if (browser && product) {

		company		= product.company as Company_Product
		description	= product.description ? product.description.replaceAll(/<\/?[^>]+(>|$)/g, '').replaceAll(/\r|\n|\t/g, ' ').replaceAll(/[ ]{2,}/g, ' ') : ''

		if (description.length > 160) description = `${description.substring(0,157)}...`

		metaValues = {
			description,
			image		: [product.image],
			title		: `${product.title} - ${PUBLIC_TITLE}`,
			url			: $page.url.href
		}

		layout.scroll(0, 'smooth')
	}

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html meta.make(metaValues)}

	<link rel="canonical" href={metaValues.url}>

</svelte:head>



<div class="product-page-wrapper">

	{#if product}

		{#if isMobile}

			<div class="product-mobile">
				<div class="image">

					{#if product.image}

						<Img src={product.image} />

					{/if}
				
				</div>
				<div class="details container">

					{#if company}

						<Button modal="producer" data={{companyId: company.id}} role="link" c="product-page-company-name">Shop all {company.name}</Button>

					{/if}
					
					<span class="title">{product.title}</span>
					<div class="price">
						<span>{product.price.asString}</span>
						<span>/{product.unit.toLowerCase()}</span>
					</div>

					{#if company}

						<span>{company.addresses[0].city.toUpperCase()}, {company.addresses[0].state}</span>

					{/if}

					<div class="add">
					
						<!-- <Quantity productId={product.id} {fulfillment} /> -->

					</div>
					<div class="availability">
						<span>Availability</span>
						<span>{product.availability}</span>

						<!-- <Fulfillment {product} bind:fulfillment={fulfillment} /> -->

					</div>
				</div>

				{#if product.description}

					<div class="description">
						<div class="container">

							<Label>Description</Label>
						
							<Rt text={product.description} />

						</div>
					</div>

				{/if}

			</div>

		{:else}

			<div class="product container">
				<div class="image-details">

					{#if product.image}

						<div class="image">
						
							<Img src={product.image} />

						</div>

					{/if}

					<div class="details">

						{#if company}

							<Button modal="producer" data={{companyId: company.id}} role="link" c="product-page-company-name">Shop all {company.name}</Button>

						{/if}

						<span class="title">{product.title}</span>
						<div class="price">
							<span>{product.price.asString}</span>
							<span>/{product.unit.toLowerCase()}</span>
						</div>

						{#if company}
						
							<span>{company.addresses[0].city.toUpperCase()}, {company.addresses[0].state}</span>

						{/if}

						{#if product.isDeleted}

							<div class="unavailable">
								<span>No Longer Available</span>
							</div>

						{:else}

							<div class="add">
							
								<!-- <Quantity productId={product.id} {fulfillment} /> -->

							</div>
							<div class="availability">
								<span>Availability</span>
								<span>{product.availability}</span>

								<!-- <Fulfillment {product} bind:fulfillment={fulfillment} /> -->

							</div>

						{/if}

					</div>
				</div>
			</div>

			{#if product.description}

				<div class="description-not-mobile container">
					<div>

						<Label>Description</Label>
					
						<Rt text={product.description} />

					</div>
				</div>

			{/if}

		{/if}

	{/if}

</div>



<style lang="sass">

	:global(.product-page-company-name)
		color: var(--cm-text-secondary)

		&:hover
			color: var(--cm-primary-hover)

	.product-page-wrapper
		margin-bottom: 4rem
		@include flex-col(4rem)

		.product-mobile
			@include flex-col(2rem)

			.details
				@include flex-col-top-left(1rem)

				.title
					font-size: 2.15rem
					font-weight: 600

				.price

					span:first-child
						font-size: 2.25rem
						font-weight: 600

					span:last-child
						font-size: 1.15rem
						color: var(--cm-text-secondary)

				.add
					margin: 1.5rem 0

				.availability
					@include flex-col-left(.75rem)
						
					span:first-child
						font-size: 1.25rem

			.description
				padding: 2rem 0
				background-color: var(--cm-background)

		.product
			position: relative
			z-index: 100
			margin-top: 3rem
			@include flex-col

			.image-details
				@include flex-row

				.image
					max-width: 50%
					width: 50%
					min-width: 50%
					margin-right: 2rem
					border-radius: var(--pico-border-radius)
					overflow: hidden

				.details
					@include flex-col-top-left(1rem)

					.title
						font-size: 2.15rem
						font-weight: 600

					.price

						span:first-child
							font-size: 2.25rem
							font-weight: 600

						span:last-child
							font-size: 1.15rem
							color: var(--cm-text-secondary)

					.add
						margin: 1.5rem 0

					.availability
						@include flex-col-left(.75rem)
							
						span:first-child
							font-size: 1.25rem

					.unavailable

						span
							font-size: 2rem
							color: var(--cm-text-secondary-dark)

		.description-not-mobile
			position: relative
			z-index: 20
			
			> div
				padding: 3rem 4rem
				background-color: var(--cm-background)


	@media (min-width: #{breakpoint('lg')})

		.product-page-wrapper

			.description-not-mobile

				> div
					padding: 3rem 8rem

	@media (min-width: #{breakpoint('xl')})

		.product-page-wrapper

			.description-not-mobile

				> div
					padding: 3rem 16rem

</style>