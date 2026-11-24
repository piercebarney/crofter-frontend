import type { User } from 'src/types/user'
import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'
import type { Sku } from 'src/types/sku'

import { PUBLIC_TAWK_PROPERTY_ID, PUBLIC_HOTJAR_ID, PUBLIC_KLAVIYO_ID } from '$env/static/public'
import { systemSettings as sS } from 'src/stores/systemSettings'
import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
import { skus as s } from 'src/stores/skus'
import { cart as c } from 'src/features/groups/consumer/modules/cart/store'



// Assets
const makeAssetHelpers = () => {

	const FETCH_INTERVAL = 15 * 60 * 1000 // 15 minutes

	let lastFetchTime: number							= Date.now(),
		intervalId: ReturnType<typeof setInterval>|null	= null,
		listenerActive: boolean							= false

	// Start interval when visible
	const _startInterval = () => {

		if (intervalId) return // Already running
		
		intervalId = setInterval(_fetchAssets, FETCH_INTERVAL)
	}

	// Stop interval when hidden
	const _stopInterval = () => {

		if (intervalId) {

			clearInterval(intervalId)

			intervalId = null
		}
	}

	// Handle visibility changes
	const _handleVisibilityChange = () => {

		// User left - stop interval
		if (document.hidden) _stopInterval()
		else {
			
			// User returned - check if 15+ minutes have passed
			const timeSinceLastFetch = Date.now() - lastFetchTime
			
			if (timeSinceLastFetch >= FETCH_INTERVAL) _fetchAssets()

			// Restart interval
			_startInterval()
		}
	}

	const _fetchAssets = async () => {

		lastFetchTime = Date.now()

		await pL.fetch()

		await s.fetch()

		c.revalidate()
	}

	return {

		init : (locations:PickUpLocation[], skus:Sku[]) => {

			if (locations) pL.set(locations)

			if (skus) s.set(skus)
		},

		fetch : (): (() => void) => {

			// Prevent duplicate initialization
			if (listenerActive) {

				console.warn('assetHelpers.fetch() already active')

				return () => {} // Return no-op cleanup
			}

			// Start interval and add visibility listener
			_startInterval()

			document.addEventListener('visibilitychange', _handleVisibilityChange)

			listenerActive = true

			// Return cleanup function
			return () => {

				_stopInterval()

				document.removeEventListener('visibilitychange', _handleVisibilityChange)

				listenerActive = false
			}

		}
	}
}

export const assetHelpers = makeAssetHelpers()


// Tawk.to
const makeTawkToHelpers = () => {

	let isLoaded: boolean		= false,
		scriptLoaded: boolean	= false,
		initialized: boolean	= false,
		currentAttributes: any	= {},
		denied: boolean			= true

	// Load Tawk.to script
	const _loadTawkScript = () => {

		// Prevent duplicate script loading
		if (scriptLoaded) return

		const tawkScript = document.createElement('script')

		tawkScript.type		= 'text/javascript'
		tawkScript.async	= true
		tawkScript.src		= `https://embed.tawk.to/${PUBLIC_TAWK_PROPERTY_ID}/YOUR_TAWK_WIDGET_ID`
		tawkScript.charset	= 'UTF-8'

		tawkScript.setAttribute('crossorigin', '*')
		
		document.head.appendChild(tawkScript)

		scriptLoaded = true
	}

	// Function to update visitor data in Tawk
	const _update = async (userData: User) => {

		// Only proceed if Tawk is loaded and user is logged in with email
		if (!isLoaded || !userData || !userData.id || !userData.email) return
		
		const tawkApi = (window as any).Tawk_API

		if (!tawkApi || !tawkApi.setAttributes) return

		const attributes = {
			name	: `${userData.firstName} ${userData.lastName}`.trim(),
			email	: userData.email,
			phone	: userData.phoneNumber || '',
			userId	: userData.id,
			zipCode	: userData.zipCode
		}

		if (JSON.stringify(attributes) == JSON.stringify(currentAttributes)) return
		
		try {

			// Set visitor attributes
			tawkApi.setAttributes(attributes, (error: any) => {

				if	(error) console.error('Error setting Tawk visitor attributes:', error)
			})

			currentAttributes = attributes

		} catch (err) {
			
			console.error('Error in updateTawkVisitorData:', err)
		}
	}

	return {

		init : (userData:User) => {

			denied = !sS.val('integration.tawkTo')

			// If denied or already initialized, return
			if (denied || initialized) return

			setTimeout(() => {

				// Set up callback BEFORE loading script to avoid race condition
				const tawkApi = (window as any).Tawk_API = (window as any).Tawk_API || {}
				
				tawkApi.onLoad = () => {

					isLoaded = true

					_update(userData)
				}

				// Now load the script
				_loadTawkScript()

				initialized = true

				console.log('Tawk.to initialized')

			}, 500)
		},

		update : (userData:User) => {

			if (denied) return

			_update(userData)
		}
	}
}

export const tawkToHelpers = makeTawkToHelpers()



// Hotjar
const makeHotjarHelpers = () => {

	let scriptLoaded: boolean	= false,
		initialized: boolean	= false,
		denied: boolean			= true

	// Load Hotjar script
	const _loadHotjarScript = () => {

		// Prevent duplicate script loading
		if (scriptLoaded) return

		const hotjarScript = document.createElement('script')

		hotjarScript.type	= 'text/javascript'
		hotjarScript.async	= true
		hotjarScript.src	= `https://static.hj.contentsquare.net/c/csq-${PUBLIC_HOTJAR_ID}.js`

		document.head.appendChild(hotjarScript)

		scriptLoaded = true
	}

	return {

		init : () => {

			denied = !sS.val('integration.hotjar')

			// If denied or already initialized, return
			if (denied || initialized) return

			setTimeout(() => {

				// Initialize Hotjar settings BEFORE loading script to avoid race condition
				;(window as any).hj = (window as any).hj || function (...args: any[]) {((window as any).hj.q=(window as any).hj.q||[]).push(args)}
				;(window as any)._hjSettings = { hjid: PUBLIC_HOTJAR_ID }

				// Now load the script
				_loadHotjarScript()

				initialized = true

				console.log('Hotjar initialized')

			}, 500)
		}
	}

}

export const hotjarHelpers = makeHotjarHelpers()



// Klaviyo
const makeKlaviyoHelpers = () => {

	// Track if we've found and processed the teaser
	let teaserProcessed: boolean	= false,
		lastUrl: string				= '',
		teaserCheckInterval: any	= null,
		scriptLoaded: boolean		= false,
		initialized: boolean		= false,
		denied: boolean				= true

	const _loadKlaviyoScript = () => {

		// Prevent duplicate script loading
		if (scriptLoaded) return

		const klaviyoScript = document.createElement('script')

		klaviyoScript.type	= 'text/javascript'
		klaviyoScript.async	= true
		klaviyoScript.src	= `https://static.klaviyo.com/onsite/js/${PUBLIC_KLAVIYO_ID}/klaviyo.js`

		document.head.appendChild(klaviyoScript)

		scriptLoaded = true
	}
	
	// Function to check and hide teaser based on page
	const _hideTeaserOnRestrictedPages = (teaser: HTMLElement) : boolean => {

		if (!teaser) return false
		
		const isHomepage = window.location.pathname === '/'
		
		// Only show on homepage
		teaser.style.display = isHomepage ? '' : 'none'

		return true
	}
	
	// Find and process the teaser element
	const _findAndProcessTeaser = () => {

		const teaser = document.querySelector('div[role=dialog].needsclick')?.parentElement?.parentElement
		
		if (teaser) {

			teaserProcessed = _hideTeaserOnRestrictedPages(teaser)
			
			// If we successfully processed the teaser, clear the interval
			if (teaserProcessed && teaserCheckInterval) {

				clearInterval(teaserCheckInterval)
				
				teaserCheckInterval = null
			}
		}
	}
	
	// Start checking for teaser
	const _startTeaserCheck = () => {

		// Clear existing interval if any
		if (teaserCheckInterval) clearInterval(teaserCheckInterval)
		
		// Immediately try to find teaser
		_findAndProcessTeaser()
		
		// Set up interval to keep checking until found
		teaserCheckInterval = setInterval(() => _findAndProcessTeaser(), 100)
		
		// Stop checking after 5 seconds to prevent endless intervals
		setTimeout(() => {

			if (teaserCheckInterval) {

				clearInterval(teaserCheckInterval)

				teaserCheckInterval = null
			}
			
		}, 5000)
	}

	// Check for URL changes
	const _checkUrlChange = () => {

		const currentUrl = window.location.href
		
		if (currentUrl !== lastUrl) {

			lastUrl = currentUrl
			
			// Reset processed flag and start checking again
			teaserProcessed = false

			_startTeaserCheck()
		}
	}

	return {

		init : (): (() => void) => {

			denied = !sS.val('integration.klaviyo')

			// If denied or already initialized, return
			if (denied || initialized) return () => {}

			_loadKlaviyoScript()

			// Run on initial page load
			document.addEventListener('DOMContentLoaded', _startTeaserCheck)

			// Handle client-side navigation
			window.addEventListener('popstate', _startTeaserCheck)
			
			// Observe DOM changes to detect SPA navigation
			const observer = new MutationObserver(() => {

				_checkUrlChange()
				
				if (!teaserProcessed) _findAndProcessTeaser()
			})
			
			observer.observe(document, { subtree: true, childList: true })

			initialized = true

			console.log('Klaviyo initialized')

			// Return cleanup function (optional - for future use)
			return () => {

				if (teaserCheckInterval) {

					clearInterval(teaserCheckInterval)

					teaserCheckInterval = null
				}

				observer.disconnect()

				document.removeEventListener('DOMContentLoaded', _startTeaserCheck)

				window.removeEventListener('popstate', _startTeaserCheck)

				initialized = false
			}
		}

	}
}

export const klaviyoHelpers = makeKlaviyoHelpers()



// Zapier
const makeZapierHelpers = () => {

	let initialized: boolean	= false,
		denied: boolean			= true

	const _sendUtmData = async (params:URLSearchParams, utmCampaign:string, userData:User|null) => {

		try {

			const payload = {
				name		: userData ? `${userData.firstName} ${userData.lastName}`.trim() : '',
				phone		: userData?.phoneNumber || '',
				email		: userData?.email || '',
				utm_source	: params.get('utm_source') || '',
				utm_medium	: params.get('utm_medium') || '',
				utm_campaign: utmCampaign,
				utm_content	: params.get('utm_content') || '',
				utm_term	: params.get('utm_term') || ''
			}

			const response = await fetch('/api/zapier/utm', {
				method	: 'POST',
				headers	: { 'Content-Type': 'application/json' },
				body	: JSON.stringify(payload)
			})

			if (response.ok) {

				console.log('UTM data sent to Zapier')

				localStorage.setItem(`zapier_utm_sent_${utmCampaign}`, 'true')

			} else {

				throw new Error('Failed to send data to Zapier')
			}

		} catch (error) {

			console.error('Error sending UTM data to Zapier:', error)
		}

	}

	return {

		init : (userData: User|null) => {

			denied = !sS.val('integration.zapier')

			// If denied or already initialized, return
			if (denied || initialized) return

			setTimeout(() => {

				const params		= new URLSearchParams(window.location.search)
				const utmCampaign	= params.get('utm_campaign')

				if (!utmCampaign) return

				// Check if already sent for this campaign
				const hasSent = localStorage.getItem(`zapier_utm_sent_${utmCampaign}`)

				if (hasSent) return

				// Send UTM data (works for both logged-in users and anonymous visitors)
				_sendUtmData(params, utmCampaign, userData)

				initialized = true

				console.log('Zapier initialized')

			}, 500)
		}
	}
}

export const zapierHelpers = makeZapierHelpers()