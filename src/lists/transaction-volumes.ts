import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'0-10000',		title:'$0 - $10,000',			id:'10000'},
	{name:'10000-25000',	title:'$10,000 - $25,000',		id:'25000'},
	{name:'25000-50000',	title:'$25,000 - $50,000',		id:'50000'},
	{name:'50000-100000',	title:'$50,000 - $100,000',		id:'100000'},
	{name:'100000-250000',	title:'$100,000 - $250,000',	id:'250000'},
	{name:'250000-1000000',	title:'$250,000 - $1,000,000',	id:'1000000'},
]

export const transactionVolumeList = list

export const transactionVolumes = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Transaction Volume')