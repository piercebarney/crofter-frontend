/**
 * Circuit Breaker Pattern Implementation
 * 
 * Protects the application from cascading failures when the backend is down.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Backend is failing, requests fail fast without hitting backend
 * - HALF_OPEN: Testing if backend has recovered
 * 
 * Flow:
 * 1. Start in CLOSED state
 * 2. If failures exceed threshold → OPEN (fail fast)
 * 3. After timeout → HALF_OPEN (test recovery)
 * 4. If test succeeds → CLOSED (resume normal operation)
 * 5. If test fails → OPEN (continue failing fast)
 */

import { createLogger } from './logger'


const logger = createLogger('circuitBreaker')


enum CircuitState {
	CLOSED = 'CLOSED',
	OPEN = 'OPEN',
	HALF_OPEN = 'HALF_OPEN'
}


type CircuitBreakerOptions = {
	failureThreshold?: number		// Number of failures before opening circuit
	successThreshold?: number		// Number of successes to close circuit from half-open
	timeout?: number				// Time in ms before attempting recovery
	name?: string					// Name for logging
}


class CircuitBreaker {

	private state: CircuitState = CircuitState.CLOSED
	private failureCount: number = 0
	private successCount: number = 0
	private nextAttempt: number = Date.now()
	private readonly failureThreshold: number
	private readonly successThreshold: number
	private readonly timeout: number
	private readonly name: string


	constructor(options: CircuitBreakerOptions = {}) {

		this.failureThreshold = options.failureThreshold ?? 5
		this.successThreshold = options.successThreshold ?? 2
		this.timeout = options.timeout ?? 60000 // 1 minute
		this.name = options.name ?? 'default'
	}


	/**
	 * Execute a function with circuit breaker protection
	 * @param fn Function to execute
	 * @param correlationId Correlation ID for logging
	 * @returns Result of function execution
	 */
	async execute<T>(fn: () => Promise<T>, correlationId?: string): Promise<T> {

		// Check if circuit is open
		if (this.state === CircuitState.OPEN) {

			// Check if enough time has passed to try again
			if (Date.now() < this.nextAttempt) {

				logger.warn('Circuit breaker is OPEN - failing fast', {
					correlationId,
					name: this.name,
					nextAttempt: new Date(this.nextAttempt).toISOString()
				})

				// Throw error with code for user-friendly message
				const error: any = new Error(`Circuit breaker is OPEN for ${this.name}`)
				error.code = 'WEB-NET-5'
				error.circuitBreakerOpen = true
				throw error
			}

			// Transition to half-open to test recovery
			this.state = CircuitState.HALF_OPEN
			this.successCount = 0

			logger.info('Circuit breaker transitioning to HALF_OPEN', {
				correlationId,
				name: this.name
			})
		}

		try {

			const result = await fn()

			// Success - record it
			this.onSuccess(correlationId)

			return result

		} catch (error) {

			// Failure - record it with error details
			this.onFailure(correlationId, error)

			throw error
		}
	}


	private onSuccess(correlationId?: string): void {

		this.failureCount = 0

		if (this.state === CircuitState.HALF_OPEN) {

			this.successCount++

			if (this.successCount >= this.successThreshold) {

				// Enough successes - close the circuit
				this.state = CircuitState.CLOSED
				this.successCount = 0

				logger.info('Circuit breaker CLOSED - service recovered', {
					correlationId,
					name: this.name
				})
			}
		}
	}


	private onFailure(correlationId?: string, error?: any): void {

		this.failureCount++
		this.successCount = 0

		// Build detailed error info
		const errorInfo: any = {
			message: error?.message || String(error)
		}
		if (error?.code) errorInfo.code = error.code
		if (error?.status) errorInfo.status = error.status
		if (error?.cause) errorInfo.cause = String(error.cause)
		if (error?.originalError) {
			errorInfo.originalError = error.originalError.message || String(error.originalError)
			if (error.originalError.cause) errorInfo.originalCause = String(error.originalError.cause)
		}

		if (this.state === CircuitState.HALF_OPEN) {

			// Failed during recovery test - reopen circuit
			this.state = CircuitState.OPEN
			this.nextAttempt = Date.now() + this.timeout

			logger.error('Circuit breaker reopened - recovery test failed', {
				correlationId,
				name: this.name,
				nextAttempt: new Date(this.nextAttempt).toISOString(),
				error: errorInfo
			})

		} else if (this.failureCount >= this.failureThreshold) {

			// Too many failures - open circuit
			this.state = CircuitState.OPEN
			this.nextAttempt = Date.now() + this.timeout

			logger.error('Circuit breaker OPENED - too many failures', {
				correlationId,
				name: this.name,
				failureCount: this.failureCount,
				threshold: this.failureThreshold,
				nextAttempt: new Date(this.nextAttempt).toISOString(),
				lastError: errorInfo
			})
		} else {
			// Log individual failures before threshold is reached
			logger.warn('Circuit breaker failure recorded', {
				correlationId,
				name: this.name,
				failureCount: this.failureCount,
				threshold: this.failureThreshold,
				error: errorInfo
			})
		}
	}


	/**
	 * Get current circuit state
	 */
	getState(): CircuitState {
		return this.state
	}


	/**
	 * Get circuit statistics
	 */
	getStats() {
		return {
			state: this.state,
			failureCount: this.failureCount,
			successCount: this.successCount,
			nextAttempt: this.state === CircuitState.OPEN ? new Date(this.nextAttempt).toISOString() : null
		}
	}


	/**
	 * Manually reset the circuit breaker
	 */
	reset(): void {

		this.state = CircuitState.CLOSED
		this.failureCount = 0
		this.successCount = 0
		this.nextAttempt = Date.now()

		logger.info('Circuit breaker manually reset', {
			name: this.name
		})
	}
}


// Create a singleton circuit breaker for the API
export const apiCircuitBreaker = new CircuitBreaker({
	failureThreshold: 5,		// Open after 5 failures
	successThreshold: 2,		// Close after 2 successes in half-open
	timeout: 60000,				// Wait 1 minute before retry
	name: 'api'
})


// Export for creating custom circuit breakers
export { CircuitBreaker, CircuitState }
