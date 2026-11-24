import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'ceo',				title:'CEO',				id:'CEO'},
	{name:'cfo',				title:'CFO',				id:'CFO'},
	{name:'chairman',			title:'Chairman',			id:'CHAIRMAN'},
	{name:'comptroller',		title:'Comptroller',		id:'COMPTROLLER'},
	{name:'director',			title:'Director',			id:'DIRECTOR'},
	{name:'general-manager',	title:'General Manager',	id:'GENERAL_MANAGER'},
	{name:'officer-manager',	title:'Officer Manager',	id:'OFFICER_MANAGER'},
	{name:'owner',				title:'Owner',				id:'OWNER'},
	{name:'partner',			title:'Partner',			id:'PARTNER'},
	{name:'president',			title:'President',			id:'PRESIDENT'},
	{name:'treasurer',			title:'Treasurer',			id:'TREASURER'},
	{name:'vice-president',		title:'Vice President',		id:'VICE_PRESIDENT'},
]

export const merchantApplicationTitleList = list

export const merchantApplicationTitles = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Professional Title')