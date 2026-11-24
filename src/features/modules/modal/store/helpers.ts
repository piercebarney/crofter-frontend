import type { Modal, ModalPersist } from 'src/features/modules/modal/types'
import type { Alert } from 'src/types/alert'
import type { SvelteComponent } from 'svelte'

import { browser } from '$app/environment'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'



export const modalHelpers = (subscribe:any, update:any): Record<string,any> => {

	if (browser) {

		const openClass			= 'modal-is-open'
		const openingClass		= 'modal-is-opening'
		const closingClass		= 'modal-is-closing'
		const switchingOutClass	= 'modal-is-switching-out'
		const switchingInClass	= 'modal-is-switching-in'
		const animationDuration	= 400
			
		const modal = {...setGet(subscribe, update),

			onOpen : (onOpen:any) => update((v:Modal) => { v.onOpen = onOpen; return v }),

			onClose : (onClose:any) => update((v:Modal) => { v.onClose = onClose; return v }),

			onOpenByName : (name:string, onOpen:any) => update((v:Modal) => { v.onOpenByName[name] = (m:Modal) => onOpen(m); return v }),

			onCloseByName : (name:string, onClose:any) => update((v:Modal) => { v.onCloseByName[name] = (m:Modal) => onClose(m); return v }),

			open : (name:string, data:any, persist:ModalPersist|null = null) => {

				const $modal: Modal					= get({subscribe})
				const component: SvelteComponent	= $modal.registry[name as keyof typeof $modal.registry]

				if (persist) update((v:Modal) => {

					const name:string|undefined = v.persist.find((p:ModalPersist) => p.name == persist.name)?.name

					if (!name) {

						persist.alert = {
							closing	: v.alert.closing,
							data	: v.alert.data,
							onClose	: v.alert.onClose,
							open	: v.alert.open
						}

						v.persist.push(persist)
					}

					return v
				})

				if ($modal.open) {

					const open = () => {
						
						document.documentElement.classList.add(switchingOutClass)

						setTimeout(() => {
					
							document.documentElement.classList.remove(switchingOutClass)

							update((v:Modal) => {

								if (v.name) v.callerStack.push({name:v.name, data:v.data, values:data?.values ?? null})

								v.data = data
								v.comp = component
								v.name = name

								v.alert.closing	= false
								v.alert.data	= null
								v.alert.onClose	= null
								v.alert.open	= false
								
								return v
							})

							document.documentElement.classList.add(switchingInClass)

							setTimeout(() => document.documentElement.classList.remove(switchingInClass), animationDuration)

							if (typeof $modal.onOpen === 'function') $modal.onOpen(get({subscribe}))

							if (typeof $modal.onOpenByName[name] === 'function') $modal.onOpenByName[name](get({subscribe}))

						}, animationDuration / 2)
					}

					update((v:Modal) => { v.alert.closing = true; return v })

					const openAlert = $modal.alert.onClose && !$modal.alert.onClose.exception?.includes(name) && !data?.values && !$modal.alert.open

					if	(openAlert)	update((v:Modal) => {v.alert.open = true; return v})
					else			open()		

				} else {
				
					update((v:Modal) => {

						v.open = true
						v.data = data
						v.comp = component
						v.name = name
						
						return v
					})

					document.documentElement.classList.add(openClass, openingClass)

					setTimeout(() => document.documentElement.classList.remove(openingClass), animationDuration)

					if (typeof $modal.onOpen === 'function') $modal.onOpen(get({subscribe}))

					if (typeof $modal.onOpenByName[name] === 'function') $modal.onOpenByName[name](get({subscribe}))
				}
			},

			close : (hardClose:boolean = false) => {

				const $modal: Modal = get({subscribe})

				const close	= () => {

					if (typeof $modal.onClose === 'function') setTimeout(() => $modal.onClose(), animationDuration)

					if (typeof $modal.onCloseByName[$modal.name] === 'function') $modal.onCloseByName[$modal.name](get({subscribe}))

					document.documentElement.classList.add(closingClass)
		
					setTimeout(() => {

						document.documentElement.classList.remove(closingClass, openClass)
		
						update((v:Modal) => {

							const index:number = v.persist.findIndex((p:ModalPersist) => p.name == v.name)

							if (index > -1) v.persist.splice(index, 1)

							v.hardClose		= false
							v.onOpen		= null
							v.onClose		= null
							v.open 			= false
							v.data 			= null
							v.comp 			= undefined
							v.name			= ''
							v.callerStack	= []
							v.values		= null

							v.alert.closing	= false
							v.alert.data	= null
							v.alert.onClose	= null
							v.alert.open	= false
							
							return v
						})
		
					}, animationDuration)
				}

				update((v:Modal) => { 
					
					v.hardClose		= v.hardClose || hardClose
					v.alert.closing	= true
					
					return v
				})

				const openAlert = $modal.alert.onClose && !$modal.alert.onClose.exception?.includes($modal.name) && !$modal.alert.open

				if (openAlert) update((v:Modal) => {v.alert.open = true; return v})
				else {

					const stack: {name:string, data:any, values:Record<string, any>|null}|undefined = $modal.callerStack.pop()
			
					if	(!$modal.hardClose && stack) {
					
						update((v:Modal) => ({...v, values:stack?.values ?? null, name:''}))

						if (stack.data?.values) delete stack.data.values
					
						modal.open(stack.name, stack.data)
					
					} else close()
				}
			},

			clear : () => {

				document.documentElement.classList.remove(openClass, openingClass, closingClass, switchingOutClass, switchingInClass)

				update((v:Modal) => {

					v.hardClose		= false
					v.onOpen		= null
					v.onClose		= null
					v.open 			= false
					v.data 			= null
					v.comp 			= undefined
					v.name			= ''
					v.callerStack	= []
					v.values		= null

					v.alert.closing	= false
					v.alert.data	= null
					v.alert.onClose	= null
					v.alert.open	= false
					
					return v
				})
			},

			openAlert : () => update((v:Modal) => {v.alert.open = true; return v}),

			closeAlert : () => update((v:Modal) => {
				
				v.alert.closing	= false
				v.alert.open = false
				
				return v
			
			}),

			clearAlert : () => update((v:Modal) => {
				
				v.alert.closing	= false
				v.alert.data	= null
				v.alert.onClose	= null
				v.alert.open	= false
				
				return v

			}),

			alert : (data:Alert) => new Promise((resolve) => update((v:Modal) => {
					
				v.alert.open			= true
				v.alert.data			= data
				v.alert.data.resolve	= resolve
				
				return v
			})),

			formAlert : (formElement:HTMLFormElement, data:Alert = {}) => {

				const $modal: Modal = get({subscribe})

				if (!data?.type)	data.type = 'warning'
				if (!data?.message)	data.message = "You have unsaved changes. If you leave without saving you'll lose all your work. This cannot be undone."

				formElement.querySelector('button[type=submit]')?.addEventListener('click', () => update((v:Modal) => { v.alert.onClose = null; return v }))
			
				return new Promise((resolve) => {

					if ($modal.values) {
						
						update((v:Modal) => {
						
							if (data) {

								data.resolve = resolve

								v.alert.onClose	= data
							}
							
							return v
							
						})
				
					} else {
						
						formElement.querySelectorAll('input, select, textarea').forEach(element => element.addEventListener('change', () => update((v:Modal) => {
						
							if (data) {

								data.resolve = resolve

								v.alert.onClose	= data
							}
							
							return v
							
						})))
					}
				})
			}
		}

		return modal
	}

	return {}
}