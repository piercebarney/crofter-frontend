<script lang="ts">

	import { systemSettings as sS } from 'src/stores/systemSettings'
	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { beforeNavigate } from '$app/navigation'
	import { classes } from 'src/lib/helpers'
	import A from 'src/components/elements/a.svelte'



	const background = 'background-color-primary'

	let visible						= false,
		klaviyoLoaded				= false,
		showFallback				= false,
		fallbackTimeout: NodeJS.Timeout,
		giveUpTimeout: NodeJS.Timeout

	$: classList = classes('wrapper', {visible}, {placeholder: !sS.val('component.hero')}, background)

	onMount(() => {

		visible			= true
		showFallback	= false
		
		if (!sS.val('component.hero')) return

		const sourceContainer	= document.querySelector(`#klaviyo-hero-container`)
		const heroDiv			= document.querySelector(`#hero`)
		
		if (!heroDiv) return

		// Check if content is already in hero div (from previous visit before unmount)
		if (heroDiv.children.length > 0) {

			klaviyoLoaded = true

			return
		}

		// If not in hero, look for it in the persistent container
		if (!sourceContainer) {

			showFallback = true
			
			return
		}

		// Function to move content from persistent container (one-way, never moves back)
		const moveContent = () => {

			if (sourceContainer.children.length > 0) {

				// Move all children from source to hero (preserves event listeners)
				while (sourceContainer.firstChild) heroDiv.appendChild(sourceContainer.firstChild)

				klaviyoLoaded	= true
				showFallback	= false

				clearTimeout(fallbackTimeout)
				clearTimeout(giveUpTimeout)

				return true
			}

			return false
		}

		// Try immediately
		if (moveContent()) return

		// Watch persistent container for Klaviyo to populate it
		const observer = new MutationObserver(() => {

			if (moveContent()) observer.disconnect()
		})

		observer.observe(sourceContainer, { childList: true, subtree: true })

		// Show fallback after 1.5s if hero hasn't loaded yet
		fallbackTimeout = setTimeout(() => {

			if (!klaviyoLoaded) showFallback = true

		}, 2.5 * 1000) // 2.5 seconds

		// Give up completely after 10s
		giveUpTimeout = setTimeout(() => {

			if (!klaviyoLoaded) {

				console.warn('Klaviyo hero failed to load after 10s')

				showFallback = true
			}

			observer.disconnect()

		}, 10 * 1000) // 10 seconds

		return () => {

			clearTimeout(fallbackTimeout)
			clearTimeout(giveUpTimeout)

			observer.disconnect()
		}
	})

	// Move content back BEFORE navigation (while DOM still exists)
	beforeNavigate((navigation) => {

		if (!browser) return

		// Only move content if navigating to a different route (not just query string changes)
		// Check if the pathname is changing
		const currentPath = navigation.from?.url.pathname
		const nextPath = navigation.to?.url.pathname

		if (currentPath === nextPath) return

		const sourceContainer	= document.querySelector(`#klaviyo-hero-container`)
		const heroDiv			= document.querySelector(`#hero`)

		if (sourceContainer && heroDiv && heroDiv.children.length > 0) {

			// Move children back to persistent container to preserve them
			while (heroDiv.firstChild) sourceContainer.appendChild(heroDiv.firstChild)
		}
	})

	onDestroy(() => {

		// Cleanup only - content already moved in beforeNavigate
		clearTimeout(fallbackTimeout)
		clearTimeout(giveUpTimeout)
	})

</script>



{#if sS.val('component.hero') || sS.val('placeholder.hero')}

	<div class={classList}>

		{#if sS.val('component.hero')}

			<!-- Always render hero div so Klaviyo has somewhere to go -->
			<div id="hero" class:loaded={klaviyoLoaded} class:hidden={showFallback && !klaviyoLoaded}></div>

			<!-- Show fallback if hero is slow, but hide it when hero finally loads -->
			{#if showFallback && !klaviyoLoaded}

				<div id="hero-fallback" class="container fallback loaded">
					<div>
						<span>From Utah's Family Farms to Your Family Table</span>
						<span>Get pasture-raised eggs, meat, produce, and more from local farmers you can trust. Orders over $80 receive free next-day delivery!</span>
						<div>
							
							<A href="#main-content" role="button">Shop for Delivery</A>
						
						</div>
					</div>
				</div>

			{/if}

		{:else if sS.val('placeholder.hero')}

			<div class="placeholder container">
				<span>HERO</span>
			</div>

		{/if}

		<span id="main-content"></span>
	</div>

{:else}

	<span></span>

{/if}



<style lang="sass">

	:global(#hero form)

		@media (max-width: #{breakpoint('lg') - 1px})

			padding-left: 0 !important
			padding-right: 0 !important

	:global(#hero form > div:has(img))

		@media (max-width: #{breakpoint('lg') - 1px})

			display: none !important

	:global(#hero form > div:not(:has(img)))

		@media (max-width: #{breakpoint('lg') - 1px})

			padding: 0 !important

	.wrapper
		// min-height: 8rem
		opacity: 0

		&.background-color-primary
			background-color: var(--cm-primary)

		&.visible
			opacity: 1

		&.placeholder
			background-color: var(--cm-primary-light)

		#hero.hidden
			display: none

		.placeholder
			height: 6rem
			color: var(--cm-text-inverse)
			@include flex-row-middle-center

		.fallback
			height: 100%
			color: var(--cm-text-inverse)
			@include flex-row-middle-left

			> div
				padding: 2rem 0
				@include flex-col-middle-left(.5rem)

				> span:first-child
					font-size: 3rem
					font-weight: 600

				> span:nth-child(2)
					font-size: 1.5rem

				> div
					margin-top: 1rem

	#main-content
		// Safari-specific fix for smooth scroll overshoot
		@supports (-webkit-hyphens:none)
			scroll-margin-top: 3rem

</style>
