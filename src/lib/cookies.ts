/**
 * Cookie utility functions for client-side use
 */

/**
 * Sets a cookie with the given name and value
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Optional number of days until cookie expiration (default: 30)
 * @param path - Optional cookie path (default: '/')
 */
export function setCookie(name: string, value: string | null, days: number = 30, path: string = '/'): void {
	if (typeof document === 'undefined') return; // Skip during SSR

	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	
	document.cookie = `${name}=${value ?? ''}; expires=${expires.toUTCString()}; path=${path}`;
}

/**
 * Gets a cookie by name
 * @param name - Cookie name
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null; // Skip during SSR
	
	const nameEQ = name + '=';
	const ca = document.cookie.split(';');
	
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	
	return null;
}

/**
 * Deletes a cookie by name
 * @param name - Cookie name
 * @param path - Optional cookie path (default: '/')
 */
export function deleteCookie(name: string, path: string = '/'): void {
	if (typeof document === 'undefined') return; // Skip during SSR
	
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=' + path;
}
