import AppSignalBrowser from '@appsignal/javascript'
import { PUBLIC_ENV, PUBLIC_APPSIGNAL_KEY } from '$env/static/public'
import { browser } from '$app/environment'
import { stringifyAny } from '$lib/helpers'
import { registerExternalReporter, type LogContext } from '$lib/utils/logger'
import { systemSettings as sS } from 'src/stores/systemSettings'



// Build args object with only defined values (filters out undefined/null)
export const buildArgs = (options?: Record<string, any>) => {

	if (!options) return null

	const args: Record<string, any> = {}

	if (options.id !== undefined && options.id !== null) args.id = options.id
	if (options.attributes !== undefined && options.attributes !== null) args.attributes = options.attributes
	if (options.filter !== undefined && options.filter !== null) args.filter = options.filter
	if (options.limit !== undefined && options.limit !== null) args.limit = options.limit
	if (options.page !== undefined && options.page !== null) args.page = options.page
	if (options.search !== undefined && options.search !== null) args.search = options.search
	if (options.sort !== undefined && options.sort !== null) args.sort = options.sort
	if (options.include !== undefined && options.include !== null) args.include = options.include
	if (options.fields !== undefined && options.fields !== null) args.fields = options.fields
	if (options.meta !== undefined && options.meta !== null) args.meta = options.meta
	if (options.join !== undefined && options.join !== null) args.join = options.join
	if (options.set !== undefined && options.set !== null) args.set = options.set
	if (options.get !== undefined && options.get !== null) args.get = options.get
	if (options.method !== undefined && options.method !== null) args.method = options.method


	return Object.keys(args).length > 0 ? args : null
}



type Options = {
	type?: string
	file?: string
	log?: boolean
	prodLog?: boolean
	devLog?: boolean
	localLog?: boolean
	signal?: boolean
	prodSignal?: boolean
	devSignal?: boolean
	localSignal?: boolean
}

interface ReportOptions {
	log?: boolean
	prodLog?: boolean
	devLog?: boolean
	localLog?: boolean
	signal?: boolean
	prodSignal?: boolean
	devSignal?: boolean
	localSignal?: boolean
}

interface BaseReport {
	message: string
	note?: string
}

interface Base {
	file: string
	timestamp: string
}

interface Code {
	args?: Record<string, any>|null
	code?: string
	correlationId?: string
	location?: string
	result?: Record<string, any>
	action?: string
	href?: string
	pathName?: string
	status?: string
	url?: string
	error?: Record<string, any>|string|unknown
	meta?: Record<string, any>
	raw?: any
	event?: any
	props?: Record<string, any>
}

export type ErrorReport = BaseReport & Code
type Error = ErrorReport & Base

export type DebugReport = BaseReport & Code
type Debug = DebugReport & Base

export type SignalReport = BaseReport
type Signal = SignalReport & Base

export type InfoReport = BaseReport
type Info = InfoReport & Base



const IS_PROD	= PUBLIC_ENV == 'prod'
const IS_DEV	= PUBLIC_ENV == 'dev' || PUBLIC_ENV == 'staging'
const IS_LOCAL	= PUBLIC_ENV == 'local'

// Register AppSignal as external reporter for the logger system
registerExternalReporter((level, message, context: LogContext) => {
	// Only send errors and warnings to AppSignal in production
	if (IS_PROD && (level === 'error' || level === 'warn')) {
		appSignalSend(level, {
			message,
			...context,
			file: context.module || context.file
		})
	}
})

const appSignalSend = async (type:string, report:any) => {
	
	try {
		
		// Build tags object (same for both client and server)
		const tags: Record<string, any> = { type }
		
		if (report?.note) tags.note = report.note
		if (report?.file) tags.file = report.file
		if (report?.action) tags.action = report.action
		if (report?.code) tags.code = report.code
		if (report?.correlationId) tags.correlationId = report.correlationId
		if (report?.location) tags.location = report.location
		if (report?.result) tags.result = JSON.stringify(report.result)
		if (report?.args) tags.args = JSON.stringify(report.args)
		if (report?.timestamp) tags.timestamp = report.timestamp
		if (report?.href) tags.href = report.href
		if (report?.pathName) tags.pathName = report.pathName
		if (report?.status) tags.status = report.status
		if (report?.url) tags.url = report.url
		if (report?.error) tags.error = JSON.stringify(report.error)
		if (report?.meta) tags.meta = JSON.stringify(report.meta)
		if (report?.raw) tags.raw = report.raw // Already stringified in base()
		
		const error = new Error(report.message)
		
		if (browser) {
			// Client-side reporting
			const appsignal = new AppSignalBrowser({ key: PUBLIC_APPSIGNAL_KEY })
			
			appsignal.sendError(error, (span: any) => {
				span.setAction(report.action || report.file)
				span.setTags(tags)
				return span
			})
			
		} else {
			// Server-side reporting disabled for Cloudflare Workers
			// @appsignal/nodejs requires Node.js built-in modules (fs, http, os, etc.)
			// which are not available in Cloudflare Workers runtime
			// Server errors will still be logged to console

			// Server-side reporting - lazy load to avoid bundling native .node files
			// try {
			// 	const { getAppSignalServer } = await import('./appsignal-server')
			// 	const appSignalServer = getAppSignalServer()
				
			// 	if (appSignalServer) {
			// 		const tracer = appSignalServer.tracer()
			// 		tracer.sendError(error, (span: any) => {
			// 			span.setAction(report.action || report.file)
			// 			span.setTags(tags)
			// 			return span
			// 		})
			// 	}
			// } catch (err: any) {
			// 	console.error('Failed to load server-side AppSignal:', err)
			// }
		}
		
	} catch (error: any) {
		console.error('Error sending AppSignal report:', error)
	}
}

const base = (o:Options, r:any) => {

	if (o.file) r.file = o.file

	if (r.hasOwnProperty('raw')) r.raw = `<${typeof r.raw}> ${stringifyAny(r.raw)}`

	r.timestamp	= new Date().toISOString()

	return r
}

const error = (o:Options, r:ErrorReport, rO?: ReportOptions) => {

	if (!browser) sS.init()

	// Console logging: controlled by systemSettings (log.error)
	// AppSignal: environment-based (production only)

	rO = {
		prodSignal	: true,
		devSignal	: false,
		localSignal	: false,
		...rO
	}

	const report	= base(o, r) as Error
	
	// Use systemSettings for console logging control
	const shouldLog = sS.val('log.error')
	
	// Environment-based AppSignal reporting
	const signal	= (IS_PROD && (o.prodSignal || rO.prodSignal)) || (IS_DEV && (o.devSignal || rO.devSignal)) || (IS_LOCAL && (o.localSignal || rO.localSignal))

	if (shouldLog) console.error(`Error Report: ${report.message}`, report)

	if (signal) appSignalSend('error', report)

	return report
}

const debug = (o:Options, r:DebugReport, rO?: ReportOptions) => {

	if (!browser) sS.init()

	// Console logging: controlled by systemSettings (log.debug)
	// AppSignal: optional, default false

	rO = {
		signal		: false,
		prodSignal	: false,
		devSignal	: false,
		localSignal	: false,
		...rO
	}

	const report	= base(o, r) as Debug
	
	// Use systemSettings for console logging control
	const shouldLog = sS.val('log.debug')
	
	// Environment-based AppSignal reporting
	const signal	= (o.signal || rO.signal) && ((IS_PROD && (o.prodSignal || rO.prodSignal)) || (IS_DEV && (o.devSignal || rO.devSignal)) || (IS_LOCAL && (o.localSignal || rO.localSignal)))

	if (shouldLog) console.log(`Debug Report: ${report.message}`, report)

	if (signal) appSignalSend('debug', report)

	return report
}

const signal = (o:Options, r:SignalReport, rO?: ReportOptions) => {

	if (!browser) sS.init()

	// Console logging: controlled by systemSettings (log.signal)
	// AppSignal: environment-based (production only)

	rO = {
		prodSignal	: true,
		devSignal	: false,
		localSignal	: false,
		...rO
	}

	const report	= base(o, r) as Signal
	
	// Use systemSettings for console logging control
	const shouldLog = sS.val('log.signal')
	
	// Environment-based AppSignal reporting
	const signal	= (IS_PROD && (o.prodSignal || rO.prodSignal)) || (IS_DEV && (o.devSignal || rO.devSignal)) || (IS_LOCAL && (o.localSignal || rO.localSignal))

	if (shouldLog) console.log(`Signal Report: ${report.message}`, report)

	if (signal) appSignalSend('signal', report)

	return report
}

const info = (o:Options, r:InfoReport, _rO?: ReportOptions) => {

	if (!browser) sS.init()

	// Console logging: controlled by systemSettings (log.info)
	// AppSignal: none (info is console-only)

	const report = base(o, r) as Info
	
	// Use systemSettings for console logging control
	const shouldLog = sS.val('log.info')

	if (shouldLog) console.log(`Info Report: ${report.message}`, report)

	return report
}

export const reporter = (o?:Options) => {

	o = {
		type		: 'info',
		log			: false,
		prodLog		: false,
		devLog		: false,
		localLog	: false,
		signal		: false,
		prodSignal	: false,
		devSignal	: false,
		localSignal	: false,
		...o
	}

	switch (o.type) {
	
		case 'error':
			return (r: ErrorReport, rO?: ReportOptions): Error => error(o, r, rO)
		
		case 'debug':
			return (r: DebugReport, rO?: ReportOptions): Debug => debug(o, r, rO)
		
		case 'log':
			return (r: SignalReport, rO?: ReportOptions): Signal => signal(o, r, rO)
		
		default:
			return (r: InfoReport, rO?: ReportOptions): Info => info(o, r, rO)
	}
}