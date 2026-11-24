type RetryOptions = {
	maxRetries?: number
	initialDelay?: number
	maxDelay?: number
	backoffMultiplier?: number
	retryableStatuses?: number[]
	shouldRetry?: (error: any) => boolean
}


const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxRetries			: 3,
	initialDelay		: 1000,
	maxDelay			: 10000,
	backoffMultiplier	: 2,
	retryableStatuses	: [408, 429, 500, 502, 503, 504],
	shouldRetry			: () => true
}


/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after all retries exhausted
 * 
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {

	const opts = { ...DEFAULT_OPTIONS, ...options }
	let lastError: any

	for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {

		try {

			return await fn()

		} catch (error: any) {

			lastError = error

			// Check if we should retry this error
			const hasRetryableStatus = error?.status && opts.retryableStatuses.includes(error.status)
			const customShouldRetry = opts.shouldRetry(error)

			// Don't retry on client errors (4xx) unless explicitly retryable
			const isClientError = error?.status >= 400 && error?.status < 500
			const shouldSkipRetry = isClientError && !hasRetryableStatus

			if (shouldSkipRetry || !customShouldRetry) {

				throw error
			}

			// If we've exhausted retries, throw the error
			if (attempt >= opts.maxRetries) {

				throw error
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(
				opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
				opts.maxDelay
			)

			// Add jitter to prevent thundering herd (±25%)
			const jitter = delay * 0.25 * (Math.random() * 2 - 1)
			const delayWithJitter = Math.max(0, delay + jitter)

			// Wait before retrying
			await new Promise(resolve => setTimeout(resolve, delayWithJitter))
		}
	}

	// This should never be reached, but TypeScript needs it
	throw lastError
}


/**
 * Check if an error is retryable based on common patterns
 */
export function isRetryableError(error: any): boolean {

	// Network errors
	if (error instanceof TypeError && error.message.includes('fetch')) {

		return true
	}

	// Timeout errors
	if (error?.name === 'AbortError') {

		return true
	}

	// Server errors
	if (error?.status >= 500) {

		return true
	}

	// Rate limiting
	if (error?.status === 429) {

		return true
	}

	return false
}
