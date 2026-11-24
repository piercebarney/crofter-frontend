import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'public-corporation',			title:'Public Corporation',			id:'PUBLIC_CORPORATION'},
	{name:'general-partnership',		title:'General Partnership',		id:'GENERAL_PARTNERSHIP'},
	{name:'limited-liability-company',	title:'Limited Liability Company',	id:'LIMITED_LIABILITY_COMPANY'},
	{name:'private-corporation',		title:'Private Corporation',		id:'PRIVATE_CORPORATION'},
	{name:'sole-proprietorship',		title:'Sole Proprietorship',		id:'SOLE_PROPRIETORSHIP'}
]

export const merchantApplicationOwnershipStructureTypeList = list

export const merchantApplicationOwnershipStructureTypes = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Business Type')