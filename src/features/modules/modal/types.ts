import type { SvelteComponent } from 'svelte'
import type { Alert } from 'src/types/alert'



export interface ModalPersist {
	alert?: ModalAlert
	data: any
	name: string
}

export interface ModalAlert {
	closing: boolean
	data: Alert|null
	onClose: Alert|null
	open: boolean
}

export interface Modal {
	alert: ModalAlert
	callerStack: {name: string, data: any, values: Record<string, any>|null}[]
	comp: SvelteComponent|undefined
	data: Record<string,any>|null
	formChange: boolean
	hardClose: boolean
	name: string
	onOpen: any
	onClose: any
	onOpenByName: Record<string, any>
	onCloseByName: Record<string, any>
	open: boolean
	persist: ModalPersist[]
	registry: () => Promise<{ default: typeof SvelteComponent }>
	values: Record<string, any>|null
}