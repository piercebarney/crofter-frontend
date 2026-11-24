import { isCapacitorNativeApp } from 'src/lib/capacitor'

// Check if the app is running in standalone mode
export function isStandaloneMode() {
	
	if (typeof window === 'undefined') return false

	// Check for Android standalone mode
	const standalone = (navigator as Navigator & { standalone?: boolean }).standalone
	const matchStandalone = window.matchMedia('(display-mode: standalone)').matches
	const matchFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
	const matchMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches

	// Check for Capacitor native app
	const isCapacitorNative = isCapacitorNativeApp()

	return standalone || matchStandalone || matchFullscreen || matchMinimalUi || isCapacitorNative
}

// Initialize standalone mode functionality
export function initStandaloneMode() {
	
	if (typeof window === 'undefined') return

	// Force external links to open in browser
	document.addEventListener('click', (event) => {

		if (!event.target) return
		const target = (event.target as Element).closest('a')

		if (!target) return

		// If it's an external link and we're in standalone mode
		if (target.hostname !== window.location.hostname && isStandaloneMode()) {

			event.preventDefault()
			
			window.open(target.href, '_blank')
		}
	})
}
