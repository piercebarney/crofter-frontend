import type { AfterNavigate } from '@sveltejs/kit'
import type { Statuses } from './types'
import type { ProductCard } from 'src/types/product'

import { writable, type Writable } from 'svelte/store'
import { goto } from '$app/navigation'
import { page as p } from '$app/state'
import { modal as m } from 'src/features/modules/modal/store'
import { search as s } from 'src/features/groups/search/store'
import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
import { layout as l } from 'src/stores/layout'
import { setGet } from 'src/stores/helpers'



const sV: Statuses = {
	queryParamsChecked:		false,
	isPopState:				false,
	hasQueryParams:			false,
	queryStringUpdating:	false,
	queryStringUpdated:		false,
	currentZipCode:			null,
	optionName:				null
}

const sW: Writable<Statuses> = writable(JSON.parse(JSON.stringify(sV)))
export const statuses = {subscribe:sW.subscribe, ...setGet(sW.subscribe, sW.update)}

const pW: Writable<Partial<Record<string, ProductCard[] | null>>> = writable({})
export const optionProducts = {subscribe:pW.subscribe, ...setGet(pW.subscribe, pW.update)}

const fW: Writable<Partial<Record<string, number>>> = writable()
export const fetchLog = {subscribe:fW.subscribe, ...setGet(fW.subscribe, fW.update)}


// Functions to reset the statuses store
export const resetStatuses = (): void => statuses.set(JSON.parse(JSON.stringify(sV)))


// Update Query String
const _writeUrl = (zipCode:string|null, modal:{closing?:boolean, skuId?:string, companyId?:string}) : void => {

	// console.log('write url', {search:p.url.search})

	const currentParams	= new URLSearchParams(p.url.search)
	const newParams		= new URLSearchParams()
	const currentCId	= currentParams.get('c')
	const currentSId	= currentParams.get('p')
	const modalCId		= modal.companyId
	const modalSId		= modal.skuId

	let companyId	= null,
		skuId		= null

	if		(modalCId)	companyId = modalCId
	else if	(modalSId)	skuId = modalSId
	else {

		companyId	= currentCId
		skuId		= currentSId
	}

	// Set parameters only if they exist
	if (zipCode) newParams.set('z', zipCode)

	if (!modal.closing) {

		if		(skuId)		newParams.set('p', skuId)
		else if	(companyId)	newParams.set('c', companyId)
	}

	const queryStringUpdated	= statuses.get('queryStringUpdated')
	const currentStr			= currentParams.toString()
	const newStr				= newParams.toString()

	if (currentStr !== newStr) {

		statuses.set({ queryStringUpdating:true })

		const newUrl		= `${p.url.pathname}?${newStr}`
		const replaceState	= !queryStringUpdated

		goto(newUrl, { replaceState, noScroll:true, keepFocus:true })
			.then(() => setTimeout(() => statuses.set({ queryStringUpdated:true, queryStringUpdating:false }), 0))
	
	} else setTimeout(() => statuses.set({ queryStringUpdated:true }), 0)
}

export const updateQueryString = (currentZipCode:string|null, modal:{closing?:boolean, skuId?:string, companyId?:string} = {}) : void => {

	// console.log('updateQueryString', {currentZipCode, modal})

	const queryStringUpdating	= statuses.get('queryStringUpdating')
	const isPopState			= statuses.get('isPopState')

	if (queryStringUpdating || isPopState) return

	_writeUrl(currentZipCode, modal)
}


// Check Query Params
const _readUrl = () : void => {

	// console.log('_readUrl')

	const companyId		= p.url.searchParams.get('c')
	const skuId			= p.url.searchParams.get('p')
	const promoCode		= p.url.searchParams.get('pc')
	const aTCSkuId		= p.url.searchParams.get('atc')

	let enteredZipCode	= p.url.searchParams.get('z')

	if (!enteredZipCode || enteredZipCode.length != 5 || !/\d+/.test(enteredZipCode)) enteredZipCode = null

	if		(skuId)		m.open('product', {skuId})
	else if	(companyId)	m.open('producer', {companyId})

	if (promoCode) c.setPromoCode(promoCode)

	if (aTCSkuId) setTimeout(() => {
		
		c.addItem(aTCSkuId)

		l.set({overlay:l.get('overlay') != 'cart' ? 'cart' : null})
	
	}, 150) // 150 milliseconds

	setTimeout(() => s.set({ enteredZipCode }), 0)

	setTimeout(() => statuses.set({ hasQueryParams:true }), 0)
}

export const checkQueryParams = (navigation: AfterNavigate) : void => {

	// console.log('checkQueryParams', {navigation})

	const queryParamsChecked = statuses.get('queryParamsChecked')

	if (queryParamsChecked && navigation.type !== 'popstate') return

	const modalName = m.get('name')
	
	if		(p.url.search)									_readUrl()
	else if	(['product', 'producer'].includes(modalName))	m.close()

	statuses.set({ queryParamsChecked:true, isPopState:navigation.type === 'popstate' })
}