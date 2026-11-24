import { listFuncs } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'eggs',		title:'Eggs',		id:'eggs',		order:1},
	{name:'meat',		title:'Meat',		id:'meat',		order:3},
	{name:'produce',	title:'Produce',	id:'produce',	order:2},
	{name:'other',		title:'Other',		id:'other',		order:4},
	{name:'bread',		title:'Bread',		id:'bread',		order:5}
]

export const categoryList = list

export const categories = { ...listFuncs(list),

	order : (id:string) => list.find((type:Record<string,any>) => type.id == id)?.order
 }