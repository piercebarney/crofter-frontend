import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'checking',	title:'Checking',	id:'CHECKING'},
	{name:'savings',	title:'Savings',	id:'SAVINGS'},
]

export const merchantApplicationAccountTypeList = list

export const merchantApplicationAccountTypes = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Bank Account Type')