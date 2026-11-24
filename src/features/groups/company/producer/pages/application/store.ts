import type { User } from 'src/types/user'
import type { MerchantApplicationDetails, MerchantApplication_Partial } from 'src/types/company'

import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'
import { user } from 'src/stores/user'



type Application = {
	initialized:	boolean
	completed:		boolean
	deposit:		{
						bankName		: string
						holderName		: string
						accountType		: string
						accountNumber	: string
						routingNumber	: string
					}
	stages:			{
						[K in StageKey]: Stage
					}
	steps:			{
						total		: number
						completed	: number
						percent		: string
					}
	understood:		boolean
}

type StageKey = 'first' | 'second' | 'third'

type Stage = {
	completed:	boolean,
	steps:		{
					total:		number
					completed:	number
					percent:	string
				}
}




const values: Application = {
	initialized	: false,
	completed	: false,
	deposit		: {
						bankName		: '',
						holderName		: '',
						accountType		: '',
						accountNumber	: '',
						routingNumber	: ''
				},
	stages		: {
					first	: {
								completed	: false,
								steps		: {
												total		: 2,
												completed	: 0,
												percent		: '0%'
											}
							},
					second	: {
								completed	: false,
								steps		: {
												total		: 7,
												completed	: 0,
												percent		: '0%'
											}
							},
					third	: {
								completed	: false,
								steps		: {
												total		: 23,
												completed	: 0,
												percent		: '0%'
											}
							}
				},
	steps		: {
					total		: 32,
					completed	: 0,
					percent		: '0%'
				},
	understood	: false
}

const { subscribe, update } = writable(values)

const _calcAppStats = (v:Application) => {
	
	v.steps.completed	= v.stages.first.steps.completed + v.stages.second.steps.completed + v.stages.third.steps.completed
	v.steps.percent		= `${Math.round((v.steps.completed / v.steps.total) * 100)}%`
	v.completed			= v.steps.completed == v.steps.total

	return v
}

const _getStage2Steps = (application:MerchantApplication_Partial, v:Application) => {

	let stage2Steps = 0

	if (application?.business?.address?.address1)	stage2Steps++
	if (application?.business?.address?.city)		stage2Steps++
	if (application?.business?.address?.state)		stage2Steps++
	if (application?.business?.address?.zipCode)	stage2Steps++
	if (application?.business?.businessName)		stage2Steps++
	if (application?.business?.contactPhone)		stage2Steps++
	if (application?.business?.timeZoneCode)		stage2Steps++

	v.stages.second.steps.completed	= stage2Steps
	v.stages.second.steps.percent	= `${Math.round((stage2Steps / v.stages.second.steps.total) * 100)}%`

	if (v.stages.second.steps.total == stage2Steps)	v.stages.second.completed = true
	else											v.stages.second.completed = false

	return v
}

const _getStage3Steps = (application:MerchantApplication_Partial, v:Application) => {

	let stage3Steps = 0

	// business
	if (application?.business?.description) 			stage3Steps++
	if (application?.business?.ownershipStructureType) 	stage3Steps++
	if (application?.business?.registrationYear) 		stage3Steps++
	if (application?.business?.taxId) 					stage3Steps++

	// estimates
	if (application?.estimates?.annualCardsVolume)			stage3Steps++
	if (application?.estimates?.avgCardsTransactionAmount)	stage3Steps++
	if (application?.estimates?.maxTransactionAmount)		stage3Steps++

	// officer
	if (application?.officer?.firstName)			stage3Steps++
	if (application?.officer?.lastName)				stage3Steps++
	if (application?.officer?.title)				stage3Steps++
	if (application?.officer?.phone)				stage3Steps++
	if (application?.officer?.address?.address1)	stage3Steps++
	if (application?.officer?.address?.city)		stage3Steps++
	if (application?.officer?.address?.state)		stage3Steps++
	if (application?.officer?.address?.zipCode)		stage3Steps++
	if (application?.officer?.birthDate)			stage3Steps++
	if (application?.officer?.email)				stage3Steps++
	if (application?.officer?.socialSecurity)		stage3Steps++

	// deposit
	if (v.deposit.bankName)			stage3Steps++
	if (v.deposit.holderName)		stage3Steps++
	if (v.deposit.accountType)		stage3Steps++
	if (v.deposit.accountNumber)	stage3Steps++
	if (v.deposit.routingNumber)	stage3Steps++

	v.stages.third.steps.completed	= stage3Steps
	v.stages.third.steps.percent	= `${Math.round((stage3Steps / v.stages.third.steps.total) * 100)}%`

	if (v.stages.third.steps.total == stage3Steps)	v.stages.third.completed = true
	else											v.stages.third.completed = false


	return v
}

const _complete = (v:Application) => {

	v.initialized = true

	v.stages.first.completed		= true
	v.stages.first.steps.completed	= v.stages.first.steps.total
	v.stages.first.steps.percent	= '100%'

	v.stages.second.completed		= true
	v.stages.second.steps.completed	= v.stages.second.steps.total
	v.stages.second.steps.percent	= '100%'

	v.stages.third.completed		= true
	v.stages.third.steps.completed	= v.stages.third.steps.total
	v.stages.third.steps.percent	= '100%'

	v.steps.completed	= v.steps.total
	v.steps.percent		= '100%'

	v.completed			= true

	return v
}

export const application = (():any => ({ subscribe, ...setGet(subscribe, update),

	init : () => {

		const $application	= get(application) as Application
		const $user			= get(user) as User

		if ($application.initialized) return

		update((v:Application) => {

			if ($user.id && $user.companies.length > 0) {
				
				v.stages.first.completed		= true
				v.stages.first.steps.completed	= v.stages.first.steps.total
				v.stages.first.steps.percent	= '100%'

				v = _calcAppStats(v)
			}

			v.initialized = true
			
			return v
		})
	},

	updateSteps : (stage:StageKey, completed:number) => update((v:Application) => {

		v.stages[stage].steps.completed	= completed
		v.stages[stage].steps.percent	= `${Math.round((completed / v.stages[stage].steps.total) * 100)}%`
		v.stages[stage].completed		= completed == v.stages[stage].steps.total

		return _calcAppStats(v)
	}),

	updateStepsFromCompany : (details:MerchantApplicationDetails) => update((v:Application) => {

		if (details?.status) {

			const status = details.status

			if (status == 'READY' ) {

				const deposit = v.deposit

				let completed = 0

				if (deposit.bankName) completed++
				if (deposit.holderName) completed++
				if (deposit.accountType) completed++
				if (deposit.accountNumber) completed++
				if (deposit.routingNumber) completed++

				if (completed == 5) return _complete(v)

			} else if (status != 'STARTED') return _complete(v)
		}

		v = _getStage2Steps(details?.application, v)

		v = _getStage3Steps(details?.application, v)

		return _calcAppStats(v)
	}),

	updateStage3 : (details:MerchantApplicationDetails) => update((v:Application) => {

		v = _getStage3Steps(details?.application, v)

		return _calcAppStats(v)
	}),

	completeStage : (stage:StageKey) => update((v:Application) => {

		v.stages[stage].steps.completed	= v.stages[stage].steps.total
		v.stages[stage].steps.percent	= '100%'
		v.stages[stage].completed		= true

		return _calcAppStats(v)
	}),

	complete : () => update(_complete),

	understand : () => update((v:Application) => { v.understood = true; return v }),

	depositAlertCheck : () => {

		const $application	= get(application) as Application

		if ($application.stages.first.completed && $application.stages.second.completed) {
	
			const deposit = $application.deposit
	
			const stepsCompleted = $application.stages.third.steps.completed
	
			let completed = 0

			if (deposit.bankName) completed++
			if (deposit.holderName) completed++
			if (deposit.accountType) completed++
			if (deposit.accountNumber) completed++
			if (deposit.routingNumber) completed++
			
			if ((stepsCompleted - completed == 18) && completed < 5) return true
		}
	
		return false
	}

}))()