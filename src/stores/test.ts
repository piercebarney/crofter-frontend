import { writable } from 'svelte/store'
import { setGet } from 'src/stores/helpers'


const values = {
	value : null
}

const { subscribe, update } = writable(values)

export const test = (():any => ({ subscribe, ...setGet(subscribe, update),

	set : (value:any) => update((v:any) => { v.value = value; return v })

}))()