<script lang="ts">

	import { browser } from '$app/environment'
	import { layout } from 'src/stores/layout'
	import Header from 'src/features/modules/header/module.svelte'
	import Modal from 'src/features/modules/modal/module.svelte'



	export let checkout: boolean = false

	let mainWrapperElement: HTMLDivElement,
		innerWrapperElement: HTMLDivElement,
		animationFrame: number|null				= null

	const handleScroll = () => {

	    if (animationFrame) cancelAnimationFrame(animationFrame)

	    animationFrame = requestAnimationFrame(layout.setScroll)
	}

	$: overlay				= $layout.overlay
	$: mainHeight			= $layout.header.mainHeight
	$: heightWithoutMain	= $layout.header.heightWithoutMain

	$: innerWrapperElement && layout.setScrollElement(innerWrapperElement)

	$: mainWrapperElement && (mainWrapperElement.style.paddingTop = `${mainHeight}px`)
	$: innerWrapperElement && (innerWrapperElement.style.paddingTop = `${heightWithoutMain}px`)

	$:	 if	(innerWrapperElement && overlay)	innerWrapperElement.style.overflow = 'hidden'
	else if	(innerWrapperElement)				innerWrapperElement.style.overflow = 'auto'

</script>



{#if browser && overlay != 'register'}

	<div class="main-header" style="opacity: 1">
		
		<Header {checkout} />

	</div>

{/if}

<div class="main-wrapper" bind:this={mainWrapperElement}>
	<div class="main-inner-wrapper" bind:this={innerWrapperElement} on:scroll={handleScroll}>

		<main>
			<div class="body">

				<slot />

				<span style="display:contents"></span>
			</div>
			
			{#if $$slots.footer}

				<div class="main-footer">
					<div class="container">

						<slot name="footer" />

					</div>
					<div class="button-padding">
						<p>&copy; {new Date().getFullYear()} Crofter Market. All Rights Reserved.</p>
					</div>
				</div>

			{:else}

				<div class="button-padding">
					<p>&copy; {new Date().getFullYear()} Crofter Market. All Rights Reserved.</p>
				</div>

			{/if}

		</main>
		

		{#if ![null, 'fulfillment', 'order-fulfillment', 'locations', 'location-details'].includes(overlay)}
		
			<div role="presentation" class="overlay" on:click={layout.closeMenu} on:keypress={layout.closeMenu}></div>

		{/if}

	</div>

	<slot name="cart" />

</div>

{#if browser}

	<Modal />

{/if}



<style lang="sass">

	.main-header
		z-index: 100
		padding-top: env(safe-area-inset-top)
		background-color: var(--cm-nav-background)
		@include fixed-top

	.main-wrapper
		position: relative
		z-index: 10
		margin-top: env(safe-area-inset-top)
		@include fill
		// @include border(red)

		.main-inner-wrapper
			overflow: auto
			scroll-behavior: smooth
			background-color: var(--cm-background)
			transition: padding-top 0.3s ease
			@include flex-col
			@include fill
			// @include border(blue)

			main
				position: relative
				@include flex-col-between
				// @include border(green)

				.body
					flex-grow: 0
					@include flex-col
					// @include border(yellow)

				.main-footer
					flex-grow: 0
					width: 100%
					background-color: var(--cm-primary-light)
					color: var(--cm-primary-inverse)
					// @include border(purple)

					// > div:first-child
					// 	padding: 1rem

					.button-padding
						background-color: var(--cm-primary)

			.overlay
				position: fixed
				z-index: 200				
				background-color: var(--pico-modal-overlay-background-color)
				@include inset

	.button-padding
		flex-shrink: 0
		height: 100px
		max-height: 100px
		width: 100%
		font-size: .8rem
		@include flex-col-middle-center
		// @include border(yellow)

</style>