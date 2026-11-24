// PWA Install Handler
// This file handles the PWA installation detection across all pages
import { browser } from '$app/environment'

// Global state to track if the app is installed
let isAppInstalled: boolean = false

// Function to initialize the PWA install handler
export async function initPWAInstallHandler(): Promise<void> {

	if (!browser || typeof window === 'undefined') return

	// Check if the app is already installed
	if (window.matchMedia('(display-mode: standalone)').matches || 
	    window.matchMedia('(display-mode: fullscreen)').matches || 
	    window.matchMedia('(display-mode: minimal-ui)').matches) {

		// Set the app as installed
		isAppInstalled = true;
		(window as Window & { isAppInstalled?: boolean }).isAppInstalled = true;

		return;
	}
	
	// Check using getInstalledRelatedApps API if available
	if ('getInstalledRelatedApps' in navigator) {
		try {
			const apps = await (navigator as any).getInstalledRelatedApps();
			if (apps && apps.length > 0) {
				// Set the app as installed
				isAppInstalled = true;
				(window as Window & { isAppInstalled?: boolean }).isAppInstalled = true;
			}
		} catch {
			// Silently fail
		}
	}
}

// Function to check if the app is installed
export function isInstalled(): boolean {
	if (!browser || typeof window === 'undefined') return false;
	
	// Return the installation status
	return Boolean(isAppInstalled || (window as Window & { isAppInstalled?: boolean }).isAppInstalled || false);
}

// Function to check if the app is installable
export function isInstallable(): boolean {
	if (!browser || typeof window === 'undefined') return false;
	
	// Check if we're already in standalone mode (already installed)
	if ((navigator as Navigator & { standalone?: boolean }).standalone || 
	    window.matchMedia('(display-mode: standalone)').matches) return false;
	
	// Basic check for PWA criteria
	return 'serviceWorker' in navigator;
}

// We're keeping this function for compatibility, but it won't do anything now
export function showInstallPrompt(): boolean {
	return false;
}
