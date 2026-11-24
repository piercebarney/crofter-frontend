import { get } from 'svelte/store'



export const setGet = (subscribe:any, update:any) => ({

	get : (property:string = '') => {

		const store: any = get({subscribe})

		return property ? store[property] : store
	},

	set : (properties:any, replaceOnly:boolean = true) => {

		// Handle non-object types (null, undefined, primitives, arrays)
		if (properties === null || properties === undefined || typeof properties !== 'object' || Array.isArray(properties)) {
			
			update((v:any) => { v = properties; return v })

			return
		}

		const keys = Object.keys(properties)

		update((v:any) => {

			for (const key of keys) {
			
				if		(replaceOnly && Object.hasOwn(v, key))	v[key] = properties[key]
				else if	(!replaceOnly)							v[key] = properties[key]
			}

			return v
		})
	},

	setDeep : (properties:Record<string,any>) => {
		
		update((v:Record<string,any>) => {

			const mergeObjects = (target: Record<string,any>, source: Record<string,any>) => {

				for (const key in source) {

					if (Object.hasOwn(target, key)) {

						if (target[key] && source[key] && typeof target[key] === 'object' && typeof source[key] === 'object' && !Array.isArray(target[key]) && !Array.isArray(source[key])) {

							mergeObjects(target[key], source[key])

						} else {

							target[key] = source[key]
						}
					}
				}
			}

			mergeObjects(v, properties)
			
			return v
		})
	}
})