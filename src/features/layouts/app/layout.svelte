<script lang="ts">
	
	import type { User } from 'src/types/user'
	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'
	import type { Sku } from 'src/types/sku'

	import { PUBLIC_ENV, PUBLIC_BASE_URL, PUBLIC_GOOGLE_TAG_MANAGER_ID, PUBLIC_KLAVIYO_HERO_ID } from '$env/static/public'
	import { browser } from '$app/environment'
	import { onDestroy, onMount } from 'svelte'
	import { systemSettings as sS } from 'src/stores/systemSettings'
	import { user as u } from 'src/stores/user'
	import { layout as l } from 'src/stores/layout'
	import { meta } from 'src/stores/meta'
	import { reporter } from 'src/lib/reporter/module'
	import { isCapacitorNativeApp } from 'src/lib/capacitor'
	import { assetHelpers, tawkToHelpers, hotjarHelpers, klaviyoHelpers, zapierHelpers } from 'src/features/layouts/app/helpers'
	import OfflineOverlay from 'src/features/layouts/app/partials/offline-overlay.svelte'
	import DevInfo from 'src/features/layouts/app/partials/dev-info.svelte'
	// Load both CSS frameworks globally - they coexist via scoping
	import 'src/styles/css/pico-scoped.scss'
	import 'src/app.css'



	export let user: User
	export let locations: PickUpLocation[]
	export let skus: Sku[]
	export let layoutErrors: any[] | null = null

	if		(user.id == null)	u.clear()
	else if	(!$u.id)			u.set(user)

	// Log layout errors for debugging
	if (layoutErrors && layoutErrors.length > 0) {

		console.warn('Layout data loading errors:', layoutErrors)

		// // Report to AppSignal in production
		// if (browser && !dev) {

		// 	layoutErrors.forEach(err => {
				
		// 		reportError({
		// 			error: new Error(err.message),
		// 			location: `layout.load.${err.type}`,
		// 			message: err.message,
		// 			args: { code: err.code, type: err.type }
		// 		})
		// 	})
		// }
	}

	const reportError = reporter({type:'error', file:'src/features/layouts/app/layout.svelte'})

	let cleanupAssetFetch: (() => void)|null	= null,
		clientWidth: number						= 0,
		isOffline: boolean						= false,
		isCapacitor: boolean					= false

	// Watch for changes to the client width
	$: l.setWidth(clientWidth)

	// Watch for changes to the user store
	$: browser && $u && tawkToHelpers.update($u)

	meta.init('defaults', {
		description	: 'Find locally produced foods in your area, beef, chicken, eggs, milk, microgreen, and more',
		image		: [`${PUBLIC_BASE_URL}/img/logo-share.png`, '1200', '628'],
		name		: 'Crofter Market',
		robots		: PUBLIC_ENV === 'prod' ? 'index, follow' : 'noindex, nofollow',
		title		: 'Crofter Market - Shop for locally produced foods',
		twitter		: ['@CrofterMarket', 'summary_large_image'],
		type		: 'website',
		url			: PUBLIC_BASE_URL
	})

	onDestroy(() => cleanupAssetFetch && cleanupAssetFetch())

	onMount(async () => {

		// Initialize assets
		assetHelpers.init(locations, skus)

		// Fetch assets
		cleanupAssetFetch = assetHelpers.fetch()

		// Listen for offline/online events
		window.addEventListener('online', () => isOffline = false)
		window.addEventListener('offline', () => isOffline = true)

		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => reportError({
			location	: 'unhandled_rejection',
			message		: event.reason instanceof Error ? event.reason.message : String(event.reason),
			raw			: event.reason
		}))

		// Handle service worker errors
		if ('serviceWorker' in navigator) {

			navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {

				if (event.data?.type === 'ERROR') {

					const errorData = event.data.error

					reportError({
						location	: 'service_worker',
						message		: errorData.message,
						error		: errorData
					})
				}
			})

		} else console.error('serviceWorker not found')

		// Check if app is running in standalone mode (already installed)
		isCapacitor = isCapacitorNativeApp()
			
		// Initialize Tawk.to
		tawkToHelpers.init($u)

		// Initialize Hotjar
		hotjarHelpers.init()

		// Initialize Klaviyo
		klaviyoHelpers.init()

		// Initialize Zapier
		zapierHelpers.init($u)

		sS.log('.environment')
	})


</script>



<svelte:window bind:innerWidth={clientWidth}/>



<svelte:head>

	{#if PUBLIC_ENV !== 'local'}

		{@html `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${PUBLIC_GOOGLE_TAG_MANAGER_ID}');</script>`}
	
	{/if}

</svelte:head>



<div id="app" class:app-container={isCapacitor} bind:clientWidth>

	<slot />

	{#if isOffline}

		<OfflineOverlay />

	{/if}


	{#if sS.val('tool.dev')}

		<DevInfo />

	{/if}

	{#if PUBLIC_ENV !== 'local'}

		<noscript><iframe title="Google Tag Manager" src={`https://www.googletagmanager.com/ns.html?id=${PUBLIC_GOOGLE_TAG_MANAGER_ID}`} height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
	
	{/if}

	<!-- Hidden container for Klaviyo hero form - stays alive across navigation -->
	{#if sS.val('component.hero')}

		<div id="klaviyo-hero-container" class="klaviyo-form-{PUBLIC_KLAVIYO_HERO_ID}" style="display:none"></div>
		
	{/if}

</div>



<style lang="sass">

	#app
		overflow: hidden
		@include fill
		
		&.app-container
			overflow-y: auto
			height: 100vh
			-webkit-overflow-scrolling: touch
			overflow-x: hidden

</style>