<script lang="ts">

	import type { Company_Page } from 'src/types/company'

	import { PUBLIC_TITLE, PUBLIC_BASE_URL } from '$env/static/public'
	// import { onMount } from 'svelte'
	import { meta } from 'src/stores/meta'
	import { layout } from 'src/stores/layout'
	// import { search } from 'src/features/groups/search/store'
	import { routes } from 'src/lists/routes'
	import { formatPhone } from 'src/lib/helpers'
	// import Img from 'src/components/elements/img.svelte'
	import Wave from 'src/features/groups/consumer/pages/wrapper.svelte'
	import Label from 'src/components/elements/label.svelte'
	import Rt from 'src/components/elements/rt.svelte'
	// import ProductCards from 'src/components/units/product-cards/unit.svelte'



	export let company:	Company_Page
	
	const products					= company.products
	const address					= company.addresses.find(a => a.isDefault == true)
	const phone						= formatPhone(company.phoneNumber)
	const email						= company.email
	const hours						= company.operatingHours
	const bio						= company.bio

	const metaValues = {
		description	: `Meet ${company.name}${address ? `, a local producer from ${address.city}, ${address.state},` : ''} and discover the delicious products they have to offer.`,
		image		: [company.image],
		title		: `${company.name} - ${PUBLIC_TITLE}`,
		url			: `${PUBLIC_BASE_URL}${routes.pathname('producer', {path:{id:company.id, name:company.name}})}`
	}

	$: isMobile = $layout.isMobile

	// onMount(() => {

	// 	if (!$search.proximity) search.set({proximity:50})
	// })

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	<link rel="canonical" href={metaValues.url}>

	{@html meta.make(metaValues)}

</svelte:head>



<div class="company-page-wrapper">

	{#if isMobile}

		<div class="company-mobile">
			<div class="image">

				<!-- {#if company.image}

					<Img src={company.image} />
			
				{/if} -->

				<!-- <iframe 
					width="560" 
					height="315" 
					src="https://www.youtube.com/embed/xvFZjo5PgG0?controls=0" 
					frameborder="0" 
					allowfullscreen>
				</iframe> -->

			</div>
			<div class="details container">
				<span class="name">{company.name}</span>

				{#if address}

					<div class="address">
						<span>Pickup Location</span>
						<span>

							{address.address1}{#if address.address2}, {address.address2}{/if}<br>
									
							{address.city}, {address.state}, {address.zipCode}

						</span>
					</div>

				{/if}

				{#if phone || email}

					<div class="contact">
						<span>Contact Info</span>
						<span>{phone}</span>
						<span>{email}</span>
					</div>

				{/if}

				{#if hours}

					<div class="hours">
						<span>Business Hours</span>
						<span>{hours}</span>
					</div>

				{/if}

			</div>

			{#if bio}

				<div class="bio">
					<div class="container">

						<Label>Description</Label>
					
						<Rt text={bio} />

					</div>
				</div>

			{/if}


			{#if products.length > 0}

				<div class="products container">

					<!-- <ProductCards label="Available Products" products={products} /> -->

				</div>

			{/if}

		</div>

	{:else}

		<div class="company container">
			<div class="image-details">
				
				<!-- {#if company.image}

					<div class="image">

						<Img src={company.image} />
					
					</div>

				{/if} -->

				<div class="image" style="text-align:center;background-color:#000">

					<iframe title="YouTube video player" width="560" height="315" src="https://www.youtube.com/embed/2qBlE2-WL60?controls=1&autoplay=1&loop=1&playlist=2qBlE2-WL60&mute=1&rel=0&modestbranding=1&fs=0&iv_load_policy=3&autohide=1&enablejsapi=1&origin=https://shop.crofter.com&widget_title=0&widget_description=0&widget_subscribe=0&widget_more=0" frameborder="0"></iframe>

				</div>

				<div class="details">
					<span class="name">{company.name}</span>

					{#if address}

						<div class="address">
							<span>Pickup Location</span>
							<span>

								{address.address1}{#if address.address2}, {address.address2}{/if}<br>
										
								{address.city}, {address.state}, {address.zipCode}

							</span>
						</div>

					{/if}

					{#if phone || email}

						<div class="contact">
							<span>Contact Info</span>
							<span>{phone}</span>
							<span>{email}</span>
						</div>

					{/if}

					{#if hours}

						<div class="hours">
							<span>Business Hours</span>
							<span>{hours}</span>
						</div>

					{/if}

				</div>
			</div>
		</div>

		{#if bio}

			<Wave>

				<div class="bio-not-mobile container">
					<div>

						<Label>About Us</Label>
					
						<Rt text={bio} />

					</div>
				</div>

			</Wave>

		{/if}

		{#if products.length > 0}

			<div class="products container">

				<!-- <ProductCards label="Available Products" products={products} /> -->

			</div>

		{/if}

	{/if}

</div>



<style lang="sass">

	.company-page-wrapper
		@include flex-col(4rem)

		.company-mobile
			@include flex-col(2rem)

			.details
				@include flex-col-top-left(1rem)

				.name
					font-size: 2.15rem
					font-weight: 600

				.address,
				.contact,
				.hours
					@include flex-col-left(.5rem)

					span:first-child
						font-size: 1.25rem
						font-weight: 500

			.bio
				padding: 2rem 0
				background-color: var(--cm-background)

		.company
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

					.name
						font-size: 2.15rem
						font-weight: 600

					.address,
					.contact,
					.hours
						@include flex-col-left(.5rem)

						span:first-child
							font-size: 1.25rem
							font-weight: 500

		.bio-not-mobile
			position: relative
			z-index: 20
			
			> div
				padding: 3rem 4rem
				background-color: var(--cm-background)

		.products
			position: relative
			z-index: 100
			margin-bottom: 3rem

</style>