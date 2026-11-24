import { kebabCase } from 'src/lib/helpers'



export const listFuncs = (list:Record<string,any>[]) => ({
	
	get : (keyName:string, keyValue:string, properties:string[]|null = null) => {

		const item = list.find((item: Record<string,any>) => item[keyName] === keyValue)

		if (properties && item) return properties
			.filter(property => property in item)
			.map(property => ({ [property]: item[property] }))
			.reduce((accumulator, current) => ({...accumulator, ...current}), {})

		return item
	},

	id : (name:string) => list.find((type:Record<string,any>) => type.name == name)?.id,

	name : (id:string) => list.find((type:Record<string,any>) => type.id == id)?.name,

	titleById : (id:string) => list.find((type:Record<string,any>) => type.id == id)?.title,

	titleByName : (name:string) => list.find((type:Record<string,any>) => type.name == name)?.title,

	is : (name:string, id:string) => {

		const listId = list.find((type:Record<string,any>) => type.name == name)?.id

		if (listId === id) return true

		return false
	}
})

export const getSelectData = (list:Record<string,any>[], placeholder:string) => ({name:kebabCase(placeholder), placeholder, options:list.map(({id, title}) => ({value:id, option:title}))})