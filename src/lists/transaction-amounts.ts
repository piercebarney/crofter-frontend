import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'0-100',			title:'$0 - $100',			id:'100'},
	{name:'100-500',		title:'$100 - $500',		id:'500'},
	{name:'500-1000',		title:'$500 - $1,000',		id:'1000'},
	{name:'1000-5000',		title:'$1,000 - $5,000',	id:'5000'},
	{name:'5000-10000',		title:'$5,000 - $10,000',	id:'10000'},
	{name:'10000-50000',	title:'$10,000 - $50,000',	id:'50000'},
	{name:'50000-100000',	title:'$50,000 - $100,000',	id:'100000'},
]

export const transactionAmountList = list

export const transactionAmounts = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Transaction Amount')