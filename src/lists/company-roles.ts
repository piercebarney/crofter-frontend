import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'producer',		title:'Producer',		id:'PRODUCER'},
	{name:'distributor',	title:'Distributor',	id:'DISTRIBUTOR'}
]

export const companyRoleList = list

export const companyRoles = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Company Role')