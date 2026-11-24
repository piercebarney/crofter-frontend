/**
 * Correlation ID utilities for request tracking across the application stack
 * 
 * Correlation IDs help trace a single request through:
 * - Client (browser)
 * - SvelteKit endpoint
 * - Server-side API calls
 * - Backend API
 */


/**
 * Generate a unique correlation ID
 * Format: timestamp-random (e.g., "1701234567890-a3f9c2")
 */
export function generateCorrelationId(): string {

	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	
	return `${timestamp}-${random}`
}


/**
 * Extract correlation ID from request headers
 */
export function getCorrelationId(headers: Headers): string | null {

	return headers.get('x-correlation-id')
}


/**
 * Add correlation ID to headers
 */
export function setCorrelationId(headers: Record<string, string>, correlationId: string): void {

	headers['x-correlation-id'] = correlationId
}
