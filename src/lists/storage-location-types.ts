import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'premises',	title:'Premises',	id:'premises'},
	{name:'vehicle',	title:'Vehicle',	id:'vehicle'}
]

export const storageLocationTypeList = list

export const storageLocationTypes = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Storage Location Type')