import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'eastern',	title:'Eastern',	id:'EST'},
	{name:'central',	title:'Central',	id:'CST'},
	{name:'mountain',	title:'Mountain',	id:'MST'},
	{name:'pacific',	title:'Pacific',	id:'PST'},
]

export const timeZoneList = list

export const timeZones = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Time Zone')