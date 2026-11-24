import type { HandleClientError } from '@sveltejs/kit'
declare global {
	interface Window {
		__initialData: {
			userId: string|null
		}
	}
}



import { systemSettings as sS } from 'src/stores/systemSettings'
import { storage } from 'src/lib/storage'
import { initStandaloneMode } from 'src/lib/pwa'
import { initPWAInstallHandler } from 'src/lib/pwa/install-handler'
import { isCapacitorNativeApp, initCapacitor, applyCapacitorFixes } from 'src/lib/capacitor'
import { reporter } from 'src/lib/reporter/module'



const reportError = reporter({ type: 'error', file: 'hooks.client.ts' })

// Initialize settings
sS.init()

// Register service worker and initialize PWA features
export const handleServiceWorker = () => {

	if (typeof window !== 'undefined' && sS.val('feature.serviceWorker')) {

		// Initialize standalone mode detection
		initStandaloneMode()
		
		// Initialize PWA install handler
		initPWAInstallHandler()
		
		// Register service worker
		if ('serviceWorker' in navigator) {

			// Wait for the page to load
			window.addEventListener('load', async () => {

				try {

					// Register the service worker
					await navigator.serviceWorker.register('/sw.js', { scope: '/' })

				} catch (error) {

					reportError({
						location	: 'service_worker',
						message		: 'Service worker registration failed',
						error
					})
				}
			});
		}
	}
}

// Initialize Capacitor functionality
export const handleCapacitor = () => {

	if (typeof window !== 'undefined') {

		// Check if running in Capacitor native app
		if (isCapacitorNativeApp()) {

			// Initialize Capacitor plugins (status bar, splash screen)
			initCapacitor()
				.then(() => {
					
					// Apply platform-specific fixes
					applyCapacitorFixes()
				
				}).catch(error => {

					reportError({
						location	: 'capacitor',
						message		: 'Failed to initialize Capacitor',
						error
					})
				})
		}
	}
}

// Export the init function that SvelteKit expects
export function init() {

	// Simple check for initial data
	if (typeof window !== 'undefined') {

		const userId = window.__initialData?.userId

		storage.init(userId)

		// Initialize PWA features
		handleServiceWorker()
		
		// Initialize Capacitor features
		handleCapacitor()
	}
}

// Handle client-side errors - combined implementation from both files
export const handleError: HandleClientError = ({ error, event }) => {

	const message = 'An unexpected error occurred'

	reportError({
		location : 'client_error',
		message,
		error,
		event
	})

	return { message }
}