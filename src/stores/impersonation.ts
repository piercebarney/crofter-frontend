import { writable, derived, get } from 'svelte/store'
import { browser } from '$app/environment'

interface ImpersonationState {
	isImpersonating: boolean
	impersonatedUserId: string | null
	impersonatedUserEmail: string | null
}

function setCookie(name: string, value: string, days: number = 30) {
	if (!browser) return
	const expires = new Date()
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
	// Encode the value to handle special characters
	const encodedValue = encodeURIComponent(value)
	// Use Lax instead of Strict to allow cookies to be sent on navigation
	document.cookie = `${name}=${encodedValue};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
	if (!browser) return null
	const nameEQ = name + "="
	const ca = document.cookie.split(';')
	for(let i = 0; i < ca.length; i++) {
		let c = ca[i]
		while (c.charAt(0) == ' ') c = c.substring(1, c.length)
		if (c.indexOf(nameEQ) == 0) {
			const value = c.substring(nameEQ.length, c.length)
			// Decode URI component in case the value was encoded
			try {
				return decodeURIComponent(value)
			} catch {
				return value
			}
		}
	}
	return null
}

function deleteCookie(name: string) {
	if (!browser) return
	// Make sure to include SameSite when deleting
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`
}

function createImpersonationStore() {
	// Initialize with default state
	const initialState: ImpersonationState = {
		isImpersonating: false,
		impersonatedUserId: null,
		impersonatedUserEmail: null
	}
	
	// Check cookies for existing impersonation
	if (browser) {
		const userId = getCookie('ImpersonatedUserId')
		const userEmail = getCookie('ImpersonatedUserEmail')
		if (userId) {
			initialState.isImpersonating = true
			initialState.impersonatedUserId = userId
			initialState.impersonatedUserEmail = userEmail
		}
		
		// Also clear any old localStorage data
		localStorage.removeItem('impersonation')
	}
	
	const { subscribe, set } = writable<ImpersonationState>(initialState)

	return {
		subscribe,
		startImpersonation: (userId: string, userEmail: string) => {
			const state = {
				isImpersonating: true,
				impersonatedUserId: userId,
				impersonatedUserEmail: userEmail
			}
			set(state)
			if (browser) {
				// Store in cookies so server-side can access
				setCookie('ImpersonatedUserId', userId)
				setCookie('ImpersonatedUserEmail', userEmail)
				
			}
		},
		stopImpersonation: () => {
			set({
				isImpersonating: false,
				impersonatedUserId: null,
				impersonatedUserEmail: null
			})
			if (browser) {
				// Remove cookies
				deleteCookie('ImpersonatedUserId')
				deleteCookie('ImpersonatedUserEmail')
			}
		},
		getImpersonatedUserId: () => {
			const state = get({ subscribe })
			return state.isImpersonating ? state.impersonatedUserId : null
		}
	}
}

export const impersonation = createImpersonationStore()

// Derived store for easy access to impersonation status
export const isImpersonating = derived(
	impersonation,
	$impersonation => $impersonation.isImpersonating
)