import type { Alert } from 'src/types/alert'

interface HeaderAlert {
	id:		string
	data:	Alert|null
}

export interface BackButton {
	href:	string
	route:	string
}

interface Header {
	alerts:		HeaderAlert[]
	backButton:	BackButton|null
	showCart:	boolean
}

interface HeaderStore extends ReturnType<typeof setGet> {
	subscribe:		(run:(value:Header) => void, invalidate?:(value?:Header) => void) => () => void
	clearAlert:		(id:string) => void
	dismissAlert:	(id:string) => void
	alert:			(id:string, data:Alert) => Promise<void>
}

import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { setGet } from 'src/stores/helpers'



const initialValues: Header = {
	alerts		: [],
	backButton	: null,
	showCart	: true
}

const { subscribe, update } = writable(initialValues)

const createHeaderStore = () : HeaderStore => {

	const timers: Record<string, ReturnType<typeof setTimeout>> = {}

	const clearAlert = (id:string) : void => update((v:Header) : Header => {
			
		const index = v.alerts.findIndex(a => a.id == id)
		
		if (index > -1) v.alerts.splice(index, 1)
			
		return v
	})

	const dismissAlert = (id:string) : void => {

		if (!browser) return

		const alertElement = document.getElementById(`header-alert-${id}`)

		if (alertElement) alertElement.classList.remove('show')

		setTimeout(() => {

			clearAlert(id)

			clearTimeout(timers[id])
	
			delete timers[id]

		}, 1000)
	}

	const store = {subscribe, ...setGet(subscribe, update),

		clearAlert,

		dismissAlert,

		alert : (id:string, data:Alert) : Promise<void> => new Promise((resolve) : void => {
					
			if (!id || !data) return
			
			update((v:Header) : Header => {

				data.resolve = resolve

				if (data.loggedIn === undefined) data.loggedIn = true

				const alert: HeaderAlert = {id, data,}

				const index = v.alerts.findIndex(a => a.id == id)

				if (index > -1) v.alerts[index] = alert
				else v.alerts.push(alert)
				
				return v
			})

			if (data.links == undefined && data.actions == undefined && data.dismissAble !== false) timers[id] = setTimeout(() => dismissAlert(id), data?.dismissWait ? data?.dismissWait : 5 * 1000)
		
		})
	}

	return store
}

export const header = createHeaderStore()