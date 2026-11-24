import { listFuncs } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'canceled',	title:'Canceled',	id:'canceled'},
	{name:'carted',		title:'Carted',		id:'carted'},
	{name:'declined',	title:'Declined',	id:'declined'},
	{name:'fulfilled',	title:'Fulfilled',	id:'fulfilled'},
	{name:'ordered',	title:'Ordered',	id:'ordered'},
	{name:'new',		title:'New',		id:'new'},
	{name:'ready',		title:'Ready',		id:'ready'},
	{name:'refunded',	title:'Refunded',	id:'refunded'}
]

export const statusList = list

export const statuses = { ...listFuncs(list) }