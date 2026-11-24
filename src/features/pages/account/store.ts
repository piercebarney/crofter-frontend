export type Type = 'consumer'|'producer'|'distributor'

export interface ActiveAccount {
	id: string|null
	type: Type
	isConsumer: boolean
	isCompany: boolean
}

interface AccountState {
	active: ActiveAccount
}

interface AccountStore extends ReturnType<typeof setGet> {
	subscribe:	(run:(value:AccountState) => void, invalidate?:(value?:AccountState) => void) => () => void
	setActive:	(accountDetails:string, routeName?:string|boolean) => void
	switchTo:	(type:Type, id:string) => void
}

import { persist } from 'src/stores/storePersist'
import { browser } from '$app/environment'
import { goto } from '$app/navigation'
import { setGet } from 'src/stores/helpers'
import { routes } from 'src/lists/routes'



const initialValues: AccountState = {
	active : {
			id			: null,
			type		: 'consumer',
			isConsumer	: true,
			isCompany	: false,
		}
}

const { subscribe, update:u } = persist('account', initialValues)

const createAccountStore = () : AccountStore => {

	const _updateDocumentClass = (type:Type) : void => {

		document.body.classList.remove('producer')
		document.body.classList.remove('distributor')

		if		(type === 'producer')		document.body.classList.add('producer')
		else if	(type === 'distributor')	document.body.classList.add('distributor')
	}

	const _update = (type:Type, id:string) : void => u((account:AccountState) : AccountState => ({
		...account,
		active: {
			...account.active,
			type,
			id,
			isConsumer	: type == 'consumer',
			isCompany	: type != 'consumer',
		}
	}))

	const store = {subscribe, ...setGet(subscribe, u),

		setActive : (accountDetails:string, routeName:string|boolean = 'account') : void => {

			if (!browser) return
			
			const parts	= accountDetails.split(':')
			const type	= parts[0] as Type
			const id	= parts[1]

			_updateDocumentClass(type)
			
			_update(type, id)

			if (typeof routeName == 'string') {

				const route = routes.pathname(routeName)

				if (route) goto(route)
			}
		},
		
		switchTo : (type:Type, id:string) : void => {

			if (!browser) return

			_updateDocumentClass(type)
			
			_update(type, id)

			goto(routes.default())
		}
	}

	return store
}

export const account = createAccountStore()