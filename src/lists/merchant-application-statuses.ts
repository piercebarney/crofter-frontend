import { listFuncs, getSelectData } from 'src/lists/listHelpers'

const list: Record<string,any>[] = [
	{name:'approved',				title:'Approved',				id:'APPROVED'},
	{name:'approved-with-warnings',	title:'Approved with Warnings',	id:'APPROVED_WITH_WARNINGS'},
	{name:'declined',				title:'Declined',				id:'DECLINED'},
	{name:'error',					title:'Error',					id:'ERROR'},
	{name:'failed',					title:'Failed',					id:'FAILED'},
	{name:'in-review',				title:'In Review',				id:'IN_REVIEW'},
	{name:'needs-correction',		title:'Needs Correction',		id:'NEEDS_CORRECTION'},
	{name:'pending',				title:'Pending',				id:'PENDING'},
	{name:'ready',					title:'Ready',					id:'READY'},
	{name:'started',				title:'Started',				id:'STARTED'},
]

export const merchantApplicationStatusList = list

export const merchantApplicationStatuses = { ...listFuncs(list) }

export const selectData = getSelectData(list, 'Merchant Application Status')