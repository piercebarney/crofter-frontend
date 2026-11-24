/**
 * Structured logging utility for consistent log formatting
 * 
 * Provides structured logging with:
 * - Consistent format across the application
 * - Correlation ID support
 * - Environment-aware logging (dev vs production)
 * - Typed log levels
 * - Optional AppSignal integration via external reporter
 * - System settings integration for console output control
 */

import { browser } from '$app/environment'
import { systemSettings as sS } from 'src/stores/systemSettings'
import { get } from 'svelte/store'


type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = {
	correlationId?: string
	error?: any
	[key: string]: any
}

type ExternalReporter = (level: LogLevel, message: string, context: LogContext) => void

let externalReporter: ExternalReporter | null = null


/**
 * Register an external reporter (e.g., AppSignal) for production error tracking
 * This allows the reporter module to hook into the logger
 */
export function registerExternalReporter(reporter: ExternalReporter) {
	externalReporter = reporter
}


/**
 * Create a logger instance for a specific module
 */
export function createLogger(module: string) {

	const log = (level: LogLevel, message: string, context?: LogContext) => {

		const timestamp	= new Date().toISOString()
		const location	= browser ? 'client' : 'server'

		const logEntry = {
			timestamp,
			level,
			location,
			module,
			message,
			...context
		}

		// Check system settings for console logging
		let shouldLogToConsole = false
		
		try {

			if (!browser) sS.init()

			// Errors controlled by log.error, everything else by log.debug
			shouldLogToConsole = level === 'error' 
				? get(sS).val('log.error')
				: get(sS).val('log.debug')

		} catch {

			// If systemSettings fails, default to logging
			shouldLogToConsole = true
		}

		// Console output (controlled by system settings)
		if (shouldLogToConsole) {

			const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module}]`
			const suffix = context?.correlationId ? ` (${context.correlationId})` : ''

			switch (level) {

				case 'debug':
					console.debug(prefix, message, suffix, context || '')
					break

				case 'info':
					console.info(prefix, message, suffix, context || '')
					break

				case 'warn':
					console.warn(prefix, message, suffix, context || '')
					break

				case 'error':
					console.error(prefix, message, suffix, context || '')
					break
			}
		}

		// Send to external reporter (AppSignal) - ALWAYS for errors/warnings
		// This is independent of console logging settings
		if (externalReporter && (level === 'error' || level === 'warn')) {

			try {

				externalReporter(level, message, { ...logEntry, ...context })

			} catch (err) {

				// Always log reporter failures to console regardless of settings
				console.error('Failed to send to external reporter:', err)
			}
		}
	}

	return {
		debug	: (message: string, context?: LogContext) => log('debug', message, context),
		info	: (message: string, context?: LogContext) => log('info', message, context),
		warn	: (message: string, context?: LogContext) => log('warn', message, context),
		error	: (message: string, context?: LogContext) => log('error', message, context)
	}
}
