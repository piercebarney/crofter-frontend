import { listFuncs, getSelectData } from 'src/lists/listHelpers'



const list: Record<string,any>[] = [
	{name:'delivery',		title:'Delivery',		filter:'DELIVERY',		id:'delivery'}, // 336398f1-00bb-460f-ae7d-168aa0d9c947
	{name:'distribution',	title:'Distribution',	filter:'DISTRIBUTION',	id:'distribution', deprecated:true},
	{name:'pickup',			title:'Pickup',			filter:'PICKUP',		id:'pick_up'}, // 64a027a3-1892-49b3-be76-22c6f6ae2fa4
]

export const fulfillmentList = list

export const fulfillments = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Fulfillment')