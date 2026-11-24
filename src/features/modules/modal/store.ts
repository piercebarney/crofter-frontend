import type { Modal } from 'src/features/modules/modal/types'
import type { SvelteComponent } from 'svelte'

import { writable } from 'svelte/store'
import { modalHelpers } from 'src/features/modules/modal/store/helpers'
import { browser } from '$app/environment'



const getRegistry = () => {
	
	const modules = import.meta.glob('/src/features/**/modals/*.svelte', { eager: true })

	return Object.fromEntries(

		Object.entries(modules).map(([path, module]) => {

			const svelteModule	= module as { default: typeof SvelteComponent }
			const parse			= path.match(/\/([^/]+)\.svelte$/)

			if (parse) return [parse[1], svelteModule.default]
			
			console.error('Could not get name for modal at', path)

			return []
		})
	)
}

const values: Modal = {
	alert			: {
			closing		: false,
			data		: null,
			onClose		: null,
			open		: false
		},
	callerStack		: [],
	comp			: undefined,
	data			: null,
	formChange		: false,
	hardClose		: false,
	name			: '',
	onOpen			: null,
	onClose			: null,
	onOpenByName	: {},
	onCloseByName	: {},
	open			: browser ? document.documentElement.classList.contains('modal-is-open') : false,
	persist			: [],
	registry		: getRegistry(),
	values			: null
}

const { subscribe, update } = writable(values)

export const modal = (():any => ({ subscribe, ...modalHelpers(subscribe, update) }))()