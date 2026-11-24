// Server-only AppSignal module
// This file is only imported server-side to avoid Vite bundling native .node files

import { Appsignal } from '@appsignal/nodejs'
import { PUBLIC_APPSIGNAL_KEY } from '$env/static/public'

let appSignalServerInstance: Appsignal | null = null

export function getAppSignalServer(): Appsignal | null {
	if (!appSignalServerInstance && PUBLIC_APPSIGNAL_KEY) {
		try {
			appSignalServerInstance = new Appsignal({
				active: true,
				name: 'crofter-webapp',
				pushApiKey: PUBLIC_APPSIGNAL_KEY
			})
		} catch (error: any) {
			console.error('Failed to initialize server-side AppSignal:', error)
		}
	}
	return appSignalServerInstance
}
