import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'canceled',	title:'Canceled',	id:'canceled'},
	{name:'declined',	title:'Declined',	id:'declined'},
	{name:'fulfilled',	title:'Fulfilled',	id:'fulfilled'},
	{name:'ordered',	title:'Ordered',	id:'ordered'},
	{name:'ready',		title:'Ready',		id:'ready'},
	{name:'refunded',	title:'Refunded',	id:'refunded'}
]

export const orderStatusList = list

export const orderStatuses = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Order Status')