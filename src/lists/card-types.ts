import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'visa',				title:'Visa',				id:'VC'},
	{name:'mastercard',			title:'MasterCard',			id:'MC'},
	{name:'discover',			title:'Discover',			id:'DC'},
	{name:'amex',				title:'Amex',				id:'AC'},
	{name:'visa-debit',			title:'Visa (Debit)',		id:'VD'},
	{name:'mastercard-debit',	title:'MasterCard (Debit)',	id:'MD'},
]

export const cardTypeList = list

export const cardTypes = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Card Type')