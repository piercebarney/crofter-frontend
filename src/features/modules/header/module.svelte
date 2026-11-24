<script lang="ts">

	import type { Layout } from 'src/stores/layout'
	import type { Writable } from 'svelte/store'

	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { derived } from 'svelte/store'
	import { header } from 'src/features/modules/header/store'
	import { layout } from 'src/stores/layout'
	import { account as a } from 'src/features/pages/account/store'
	// import { search } from 'src/features/groups/search/store'
	import { routes } from 'src/lists/routes'
	import { scrollBorderBottom } from 'src/lib/helpers'
	import CheckoutSegment from 'src/features/modules/header/segments/checkout/segment.svelte'
	import MobileSegment from 'src/features/modules/header/segments/mobile/segment.svelte'
	import ProducerSegment from 'src/features/modules/header/segments/producer/segment.svelte'
	import DistributorSegment from 'src/features/modules/header/segments/distributor/segment.svelte'
	import ConsumerSegment from 'src/features/modules/header/segments/consumer/segment.svelte'
	// import SearchInput from 'src/features/groups/search/module.svelte'
	import Alert from 'src/features/modules/header/units/alert.svelte'
	import ImpersonationBanner from 'src/features/modules/header/units/impersonation-banner.svelte'



	// options
	export let checkout: boolean = false

	// Scroll sensitivity configuration
	// const SCROLL_UP_THRESHOLD = 10
	// const SCROLL_DOWN_THRESHOLD = 50
	// const MAX_SCROLL_VELOCITY = 300
	// const DIRECTION_CHANGE_DELAY = 100
	// const TRANSITION_DURATION = 300

	const layoutSize	= derived<Writable<Layout>, string>(layout, $layout => $layout.size)
	const layoutScroll	= derived<Writable<Layout>, Layout['scroll']>(layout, $layout => $layout.scroll)
	const searchHeight	= 0
	const wrapperMargin	= 0

	let headerElement: HTMLElement,
		containerElement: HTMLElement,
		navWrapperElement: HTMLElement,
		// searchWrapperElement: HTMLDivElement,
		headerPadding: number					= 0,
		mainHeight: number						= 0,
		// searchHeight: number					= 0,
		alertHeight: number						= 0
		// transitioning: boolean					= false,
		// searchDisabled: boolean					= false,
		// wrapperMargin: number					= 0,
		// currentScrollPosition: number			= -1,
		// lastDirection: string					= '',
		// lastActionTime: number					= 0,
		// scrollTimeout: number|null				= null,
		// currentState: string					= 'down',
		// currentSize: string						= $layoutSize,
		// currentName: string						= routes.name($page.url.pathname),
		// init: boolean							= false


	$: backButton		= $header.backButton
	$: scrollPosition	= $layoutScroll.position
	$: isMobile			= $layout.isMobile
	$: routeName		= routes.name($page.url.pathname)
	// $: fulfillment		= $search.fulfillment
	$: account			= $a.active
	$: isCompany		= account.isCompany
	$: activeType		= account.type
	// $: showSearch		= !['account', 'orders', 'product-create', 'product-edit', 'legal', 'policies', 'data-deletion', 'distributor-skus'].includes(routeName)
	// $: showDiscovery	= !['account', 'orders', 'legal', 'data-deletion'].includes(routeName)
	$: showAccount		= !['legal', 'policies', 'data-deletion'].includes(routeName)
	$: showCart			= !['legal', 'policies', 'data-deletion'].includes(routeName) && $header.showCart
	$: showAlert		= !['checkout'].includes(routeName)

	$: $layoutSize && scrollBorderBottom(scrollPosition, headerElement, {dark:true})

	$: if (containerElement && (headerPadding === 0 || $layoutSize || routeName)) headerPadding = parseInt(getComputedStyle(containerElement).paddingTop) || 0

	$: if (navWrapperElement && headerPadding && alertHeight !== undefined && (mainHeight === 0 || $layoutSize || routeName)) {

		mainHeight = navWrapperElement.offsetHeight + (headerPadding * 2) + alertHeight

		layout.setDeep({header:{mainHeight}})
	}

	// $: if (searchWrapperElement && searchHeight === 0) {

	// 	searchHeight						= searchWrapperElement.offsetHeight
	// 	searchWrapperElement.style.opacity	= '1'
	// 	searchWrapperElement.style.height	= `${searchHeight}px`
	// 	wrapperMargin						= isMobile ? searchHeight : 0

	// 	layout.setDeep({header:{searchHeight}})
	
	// } else if (!searchWrapperElement && searchHeight !== 0 && $layoutSize && routeName) {

	// 	searchHeight = 0

	// 	layout.setDeep({header:{searchHeight}})
	// }

	$: layout.setDeep({header:{heightWithSearch: mainHeight + searchHeight, heightWithoutMain: searchHeight}})

	// $: if (currentScrollPosition === -1 || $layoutSize != currentSize || routeName != currentName) {

	// 	searchDisabled			= false
	// 	transitioning			= false
	// 	currentScrollPosition	= scrollPosition
	// 	currentSize				= $layoutSize
	// 	currentName				= routes.name($page.url.pathname)
	// }

	// $: if (searchWrapperElement && isMobile && scrollPosition === 0) {

	// 	searchDisabled						= false
	// 	searchWrapperElement.style.opacity	= '1'
	// 	searchWrapperElement.style.height	= `${searchHeight}px`
	// 	wrapperMargin						= searchHeight
	// 	transitioning						= false
	// 	lastDirection						= 'up'

	// 	layout.setDeep({header:{heightWithSearch: mainHeight + searchHeight, heightWithoutMain: searchHeight}})
	// }

	// $: if (searchWrapperElement && isMobile && !transitioning && scrollPosition !== 0 && (scrollPosition < (currentScrollPosition - SCROLL_UP_THRESHOLD) || (currentScrollPosition + SCROLL_DOWN_THRESHOLD) < scrollPosition)) {

	// 	const now					= Date.now()
	// 	const timeSinceLastAction	= now - lastActionTime
	// 	const scrollVelocity		= Math.abs(scrollPosition - currentScrollPosition)
	// 	const currentDirection		= $layoutScroll.down ? 'down' : 'up'
		
	// 	// Clear any existing timeout
	// 	if (scrollTimeout) clearTimeout(scrollTimeout)

	// 	// Debounce the scroll handling
	// 	scrollTimeout = window.setTimeout(() => {

	// 		// Only trigger transition if:
	// 		// 1. We're not in a fast scroll
	// 		// 2. We haven't changed direction too quickly
	// 		// 3. Enough time has passed since last action
	// 		if (scrollVelocity < MAX_SCROLL_VELOCITY && (lastDirection === currentDirection || timeSinceLastAction > DIRECTION_CHANGE_DELAY)) {
				
	// 			transitioning	= true
	// 			lastActionTime	= now
	// 			lastDirection	= currentDirection
				
	// 			if (currentState == 'up' && ($layoutScroll.down || (scrollPosition !== 0 && !$layoutScroll.up))) {

	// 				// Show when scrolling to see less content (up the page)
	// 				searchDisabled						= false
	// 				searchWrapperElement.style.opacity	= '1'
	// 				searchWrapperElement.style.height	= `${searchHeight}px`
	// 				wrapperMargin						= searchHeight
	// 				currentState						= 'down'

	// 				layout.setDeep({header:{heightWithSearch: mainHeight + searchHeight, heightWithoutMain: searchHeight}})

	// 			} else if (currentState == 'down' && ($layoutScroll.up || (scrollPosition !== 0 && !$layoutScroll.down))) {

	// 				// Hide when scrolling to see more content (down the page)
	// 				searchDisabled						= true
	// 				searchWrapperElement.style.opacity	= '0'
	// 				searchWrapperElement.style.height	= '0px'
	// 				wrapperMargin						= 0
	// 				currentState						= 'up'

	// 				layout.setDeep({header:{heightWithSearch: mainHeight, heightWithoutMain: 0}})
	// 			}

	// 			setTimeout(() => transitioning = false, TRANSITION_DURATION)
	// 		}

	// 	}, 50) // Short debounce time to batch scroll events

	// 	currentScrollPosition = scrollPosition
	// }

	onMount(() => {

		// init = true
		
		// return () => { if (scrollTimeout) clearTimeout(scrollTimeout) }
	})

</script>



<header bind:this={headerElement}>
	<nav class="container" bind:this={containerElement}>
		<div class="nav-wrapper" bind:this={navWrapperElement}>
			<ul class={checkout ? 'checkout' : isMobile && isCompany ? 'mobile' : undefined}>

				{#if checkout}

					<CheckoutSegment />

				{:else}

					{#if isMobile && isCompany}

						<MobileSegment {backButton} {wrapperMargin} {activeType} />

					{:else if activeType == 'producer'}

						<!-- <ProducerSegment {showSearch} {showAccount} {isMobile} {routeName} {account} /> -->
						<ProducerSegment {showAccount} {routeName} />

					{:else if activeType == 'distributor'}

						<!-- <DistributorSegment {showSearch} {showAccount} {isMobile} {routeName} {account} /> -->
						<DistributorSegment {showAccount} {routeName} />

					{:else}

						<!-- <ConsumerSegment {showAccount} {showCart} {isMobile} {init} {showDiscovery} {fulfillment} /> -->
						<ConsumerSegment {showAccount} {showCart} />

					{/if}

				{/if}

			</ul>
		</div>

		<!-- {#if isMobile}

			{#if isCompany && activeType == 'distributor'}

				{#if showSearch}

					<div class="nav-search-wrapper" bind:this={searchWrapperElement} on:transitionend={() => transitioning = false}>
						<div>
					
							<SearchInput {account} {routeName} disabled={searchDisabled}/>

						</div>
					</div>

				{/if}

			{/if}

		{/if} -->

	</nav>

	{#if showAlert}

		<Alert {header} bind:height={alertHeight} />
		
	{/if}

</header>

<ImpersonationBanner />



<style lang="sass">

	:root
		--c-header-brand-width: 82px
		--c-header-font-size: 1.5rem
		--c-header-gap: .5rem
		--c-header-search-margin: 0
		--c-header-search-min-height: 50px
		--c-header-brand-margin: 0

	header
		// border-bottom: 1px solid var(--cm-primary-hover)

		nav

			ul
				gap: var(--c-header-gap)

				&.mobile
					justify-content: space-between
					
				&.checkout
					justify-content: center

			// .nav-search-wrapper		
			// 	min-width: 100%
			// 	overflow: hidden
			// 	transition: opacity 0.3s ease, height 0.3s ease
			// 	@include flex-row-bottom

			// 	> div
			// 		position: relative
			// 		width: 100%
			// 		margin: var(--cm-nav-padding-vertical) 0 calc(var(--cm-nav-padding-vertical) * -1)
			// 		padding-bottom: var(--cm-nav-padding-vertical)


	@media (min-width: #{breakpoint('sm')})
		
		:root
			--c-header-brand-width: 144px
			--c-header-gap: var(--cm-nav-element-spacing)
			--c-header-brand-margin: var(--cm-nav-button-padding-horizontal)

	@media (min-width: #{breakpoint('md')})

		:root
			--c-header-brand-width: 82px
			--c-header-search-margin: 0 var(--cm-nav-button-padding-horizontal)
			--c-header-search-min-height: 38px

	@media (min-width: #{breakpoint('lg')})

		:root
			--c-header-brand-width: 144px
			--c-header-font-size: 1.25rem
			--c-header-gap: .5rem
			--c-header-search-margin: 0
			--c-header-search-min-height: 50px

	@media (min-width: #{breakpoint('xl')})

		:root
			--c-header-brand-width: 170px
			--c-header-font-size: 1.5rem
			--c-header-gap: var(--cm-nav-element-spacing)
			--c-header-search-margin: 0 var(--cm-nav-button-padding-horizontal)

</style>