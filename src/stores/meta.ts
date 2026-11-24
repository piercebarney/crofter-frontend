import type { Meta } from 'src/types/meta'

import { writable } from 'svelte/store'
import { setGet } from 'src/stores/helpers'
import { get } from 'svelte/store'



const values : Meta = {
	base		: [],
	defaults	: {},
	tags		: []
}

const { subscribe, update } = writable(values)

const sG = setGet(subscribe, update)

const types: Record<string,any> = {
	description	: [
					{name:'description'},
					{property:'og:description'},
					{name:'twitter:description'}
				],
	image		: [
					[{property:'og:image'}, {property:'og:image:width'}, {property:'og:image:height'}],
					{name:'twitter:image'}
				],
	name		: [
					{name:'application-name'},
					{property:'og:site_name'},
					{name:'apple-mobile-web-app-title'}
				],
	robots		: [{name:'robots'}],
	title		: [
					{property:'og:title'},
					{name:'twitter:title'}
				],
	twitter		: [[{name:'twitter:site'}, {name:'twitter:card'}]],
	type		: [{property:'og:type'}],
	url			: [{property:'og:url'}],
}

const __build = (attrs:any, value:string) => {

	const parts: string[] = ['<meta']

	for (const attr of Object.keys(attrs)) {

		parts.push(`${attr}="${attrs[attr]}"`)
	}

	parts.push(`content="${value}"`)

	return `${parts.join(' ')}>`
}

const __prepare = (typeName:string, value:any) => {

	const tags: string[] = []

	if (types.hasOwnProperty(typeName)) {

		for (const type of types[typeName]) {

			if (Array.isArray(type)) {

				for (let i = 0; i < type.length; i++) {
					
					if (value[i]) tags.push(__build(type[i], value[i]))
				}

			} else tags.push(__build(type, value))
		}
	}

	return tags
}

const __gather = (properties:Record<string,string|string[]>|null, subscribe:any) => {

	const $meta: Meta			= get({subscribe})
	const baseTags:	string[]	= $meta.base == 'defaults' ? Object.keys($meta.defaults) : $meta.base as string[]
	
	let result: any[] = []

	for (const baseTag of baseTags) {

		let tags: string[]|null = null

		if		(properties && properties.hasOwnProperty(baseTag))	tags = __prepare(baseTag, properties[baseTag])
		else if	($meta.defaults.hasOwnProperty(baseTag))			tags = __prepare(baseTag, $meta.defaults[baseTag])

		if (tags) result = result.length > 0 ? [...result, ...tags] : tags
	}

	return result
}

const set = (properties:Record<string,string|string[]>|null = null) => update((v:Meta) => { v.tags = __gather(properties, subscribe); return v })

const init = (base:string[],defaults:Record<string,string|string[]>) => update((v:Meta) => {
	
	v.base		= base
	v.defaults	= defaults
	// v.tags		= __gather({}, subscribe)
	
	return v
})

const make = (properties:Record<string,string|string[]>|null = null) => {

	const tags = __gather(properties, subscribe)
	
	update((v:Meta) => { v.tags = tags; return v })

	return tags.join('')
}

export const meta = (():any => ({ subscribe,

	get : sG.get,
	set,
	init,
	make

}))()