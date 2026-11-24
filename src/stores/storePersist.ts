import { writable } from 'svelte/store'
import { storage } from 'src/lib/storage'



const valuesFunc = (storeName:string, values:any) => {

	const { active, data } = storage.get(storeName)

	if		(data)			values = data
	else if (active?.id)	storage.set(storeName, values)

	return values
}

const updateFunc = (update:any, storeName:string) => (fn:any) => update((v:any) => {

	const values = fn(v)

	storage.set(storeName, values)

	return values
})

export const persist = (storeName:string, values:any) => {

	const { set, update, subscribe } = writable(valuesFunc(storeName, values))

	return { set, update:updateFunc(update, storeName), subscribe }
}