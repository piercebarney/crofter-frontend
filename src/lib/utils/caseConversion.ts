/**
 * Memoized case conversion utilities for performance optimization
 * 
 * These functions cache conversion results to avoid repeated regex operations
 * on commonly used keys like 'id', 'name', 'created_at', etc.
 */


// Memoization caches
const camelToSnakeCache = new Map<string, string>()
const snakeToCamelCache = new Map<string, string>()


// Cache size limits to prevent memory leaks
const MAX_CACHE_SIZE = 1000


/**
 * Convert camelCase to snake_case with memoization
 * 
 * @example
 * camelToSnakeCase('userId') // 'user_id'
 * camelToSnakeCase('createdAt') // 'created_at'
 */
export function camelToSnakeCase(value: string): string {

	if (typeof value !== 'string') return value

	// Check cache first
	if (camelToSnakeCache.has(value)) {

		return camelToSnakeCache.get(value)!
	}

	// Perform conversion
	const result = value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

	// Cache result if under size limit
	if (camelToSnakeCache.size < MAX_CACHE_SIZE) {

		camelToSnakeCache.set(value, result)
	}

	return result
}


/**
 * Convert snake_case to camelCase with memoization
 * 
 * @example
 * snakeToCamelCase('user_id') // 'userId'
 * snakeToCamelCase('created_at') // 'createdAt'
 */
export function snakeToCamelCase(value: string): string {

	if (typeof value !== 'string') return value

	// Check cache first
	if (snakeToCamelCache.has(value)) {

		return snakeToCamelCache.get(value)!
	}

	// Perform conversion
	const result = value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

	// Cache result if under size limit
	if (snakeToCamelCache.size < MAX_CACHE_SIZE) {

		snakeToCamelCache.set(value, result)
	}

	return result
}


/**
 * Clear all memoization caches
 * Useful for testing or if memory usage becomes a concern
 */
export function clearCaseConversionCache(): void {

	camelToSnakeCache.clear()
	snakeToCamelCache.clear()
}


/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {

	return {
		camelToSnake: {
			size: camelToSnakeCache.size,
			maxSize: MAX_CACHE_SIZE
		},
		snakeToCamel: {
			size: snakeToCamelCache.size,
			maxSize: MAX_CACHE_SIZE
		}
	}
}
