/**
 * Capacitor utilities for native app integration
 * Handles detection, plugin initialization, and platform-specific fixes
 */

// Check if the app is running as a Capacitor native app
export function isCapacitorNativeApp() {
	
	if (typeof window === 'undefined') return false
	
	// Check for Capacitor in the window object
	const hasCapacitorObject = typeof (window as any).Capacitor !== 'undefined'
	
	// Check for Capacitor in the user agent
	const userAgent = navigator.userAgent.toLowerCase()
	const hasCapacitorInUserAgent = userAgent.includes('capacitor')
	
	// Check for native platform indicators
	const isNativePlatform = hasCapacitorObject && (window as any).Capacitor.isNativePlatform()
	
	// Check for specific platform
	const isIOS = hasCapacitorObject && (window as any).Capacitor.getPlatform() === 'ios'
	const isAndroid = hasCapacitorObject && (window as any).Capacitor.getPlatform() === 'android'
	
	return hasCapacitorObject && (isNativePlatform || isIOS || isAndroid || hasCapacitorInUserAgent)
}

/**
 * Initialize Capacitor plugins and apply platform-specific configurations
 * - Handles splash screen
 * - Configures status bar
 * - Adds platform-specific classes to HTML element
 */
export async function initCapacitor() {
	
	if (typeof window === 'undefined' || !isCapacitorNativeApp()) return
	
	try {

		// Add platform-specific class to HTML element for CSS targeting
		const platform = (window as any).Capacitor.getPlatform()

		document.documentElement.classList.add('capacitor')
		document.documentElement.classList.add(platform)
		
		// Import Capacitor plugins
		const { SplashScreen } = await import('@capacitor/splash-screen')
		const { StatusBar, Style } = await import('@capacitor/status-bar')
		
		// Configure status bar to prevent UI elements from being hidden
		try {

			// Set status bar based on platform
			if (platform === 'android') {

				// For Android, set status bar to match nav bar color
				await StatusBar.setOverlaysWebView({ overlay: false })
				await StatusBar.setBackgroundColor({ color: '#333333' })
				await StatusBar.setStyle({ style: Style.Dark })
				
			} else if (platform === 'ios') {

				// For iOS, configure status bar
				await StatusBar.setStyle({ style: Style.Dark })
			}

		} catch (statusBarError) {

			console.error('Error configuring status bar:', statusBarError)
		}
		
		// Hide splash screen immediately without waiting for any events
		SplashScreen.hide({fadeOutDuration: 500}).then(() => {

			console.log('Splash screen hidden successfully')

		}).catch((err: unknown) => {

			console.error('Error hiding splash screen:', err)
		})
		
	} catch (error: unknown) {

		console.error('Error initializing Capacitor plugins:', error)
	}
}

/**
 * Apply platform-specific fixes for Capacitor
 * - Fixes scrolling issues
 * - Handles Android keyboard behavior
 * - Fixes viewport height issues
 */
export function applyCapacitorFixes() {
	
	if (typeof window === 'undefined' || !isCapacitorNativeApp()) return
	
	const platform = (window as any).Capacitor.getPlatform()
	
	// Apply additional Android-specific fixes
	if (platform === 'android') {
		
		// Fix Android keyboard issues
		fixAndroidKeyboard()
		
		// Fix Android viewport height issues
		fixAndroidViewportHeight()
		
		// Detect keyboard visibility
		detectKeyboardVisibility()
	}
	
	// Prevent touchmove events from causing bounce effects
	document.addEventListener('touchmove', (e) => {

		// Only prevent default if at the boundary
		const target: 		Element			= e.target as Element
		const scrollable:	Element | null	= findScrollableParent(target)
		
		if (scrollable) {

			const isAtTop		= scrollable.scrollTop <= 0
			const isAtBottom	= scrollable.scrollHeight - scrollable.scrollTop <= scrollable.clientHeight
			
			if ((isAtTop && e.touches[0].screenY > e.touches[0].screenY) || (isAtBottom && e.touches[0].screenY < e.touches[0].screenY)) e.preventDefault()
		}

	}, { passive: false })
}

/**
 * Find the nearest scrollable parent of an element
 */
function findScrollableParent(element: Element | null): Element | null {
	if (!element) return null
	
	// Check if the element is scrollable
	const style = window.getComputedStyle(element)
	const overflowY = style.getPropertyValue('overflow-y')
	
	if (overflowY === 'auto' || overflowY === 'scroll') return element
	
	// Check parent
	return findScrollableParent(element.parentElement)
}

/**
 * Fix Android keyboard issues
 * - Prevents the viewport from resizing when keyboard opens
 * - Ensures input fields are visible when focused
 */
function fixAndroidKeyboard() {
	// Handle input focus to ensure the field is visible
	document.addEventListener('focusin', (event) => {
		const target = event.target
		
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
			// Wait for keyboard to appear
			setTimeout(() => {
				// Scroll the element into view
				(target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
			}, 300)
		}
	})
}

/**
 * Fix Android viewport height issues
 * - Android has issues with viewport height calculations
 * - This ensures the app container has the correct height
 */
function fixAndroidViewportHeight() {
	// Set initial viewport height
	updateViewportHeight()
	
	// Update on resize and orientation change
	window.addEventListener('resize', updateViewportHeight)
	window.addEventListener('orientationchange', () => {
		// Wait for orientation change to complete
		setTimeout(updateViewportHeight, 100)
	})
}

/**
 * Update the viewport height CSS variable
 */
function updateViewportHeight() {
	// Set a CSS variable with the viewport height
	document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`)
	
	// Find app container and update its height
	const appContainer = document.querySelector('.app-container')
	if (appContainer) {
		(appContainer as HTMLElement).style.height = `${window.innerHeight}px`
	}
}

/**
 * Detect keyboard visibility on Android
 * - Adds a class to html element when keyboard is visible
 * - Helps with CSS adjustments for keyboard
 */
function detectKeyboardVisibility() {
	// Store initial window height
	const initialHeight = window.innerHeight
	
	// Listen for resize events
	window.addEventListener('resize', () => {
		// If current height is significantly less than initial height, keyboard is likely visible
		const keyboardVisible = window.innerHeight < initialHeight * 0.8
		
		if (keyboardVisible) {
			document.documentElement.classList.add('keyboard-open')
		} else {
			document.documentElement.classList.remove('keyboard-open')
		}
	})
	
	// Also handle focus events
	document.addEventListener('focusin', (event) => {
		const target = event.target
		
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
			// Add a small delay to ensure keyboard is fully open
			setTimeout(() => {
				// If height changed significantly, add keyboard-open class
				if (window.innerHeight < initialHeight * 0.8) {
					document.documentElement.classList.add('keyboard-open')
				}
			}, 300)
		}
	})
	
	// Remove keyboard-open class on blur
	document.addEventListener('focusout', () => {
		// Add a small delay to ensure keyboard is fully closed
		setTimeout(() => {
			if (window.innerHeight >= initialHeight * 0.9) {
				document.documentElement.classList.remove('keyboard-open')
			}
		}, 300)
	})
}
