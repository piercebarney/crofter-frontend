<script lang="ts">

	import { PUBLIC_ENV,PUBLIC_ZIFT_PROXYNIZATION } from '$env/static/public'
	import { api } from 'src/lib/api'
	import { user } from 'src/stores/user'
	import { format } from 'src/lib/validate'
	import { reporter } from 'src/lib/reporter/module'
	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	// const caller:		string|null	= $modal?.data?.caller ? $modal.data.caller : null
	const label:		string		= $modal?.data?.label ? $modal.data.label : 'Add Payment Method'
	// const today:		Date		= new Date()
	// const currentYear:	number		= today.getFullYear()
	// const currentMonth:	number		= today.getMonth() + 1
	const reportError 				= reporter({type:'error', file:'src/features/groups/consumer/modals/payment-info-add.svelte'})

	let formElement:		HTMLFormElement,
		buttonReset:		(()=>void),
		error:				string|null			= null,
		holderName:			string				= PUBLIC_ENV !== 'prod' ? 'John Doe' : '',
		accountNumber:		string				= PUBLIC_ENV !== 'prod' ? '4111111111111111' : '',
		expiration:			string				= PUBLIC_ENV !== 'prod' ? '07/29' : '',
		validAccountNumber:	boolean				= PUBLIC_ENV !== 'prod' ? true : false,
		validExperation:	boolean				= PUBLIC_ENV !== 'prod' ? true : false

	// Validate account number value
	const validateAccountNumber = (_value:string, _target:HTMLInputElement|null, pass:boolean, _key:string|null) => {validAccountNumber = pass}

	// Validate expiration date format and value
	const validateExpiration = (_value:string, _target:HTMLInputElement|null, pass:boolean, _key:string|null) => {validExperation = pass}

	// Define a named callback function for ProxynizationAPI as per Zift documentation and attach it to window for global access
	(window as any).clientCallback = function(responseCode: string, responseMessage: string, proxyNumber: string) {

		if (responseCode == "A01") {

			const proxyNumberElement: HTMLFormElement	= document.querySelector('#proxy-number')!
			const paymentFormElement: HTMLElement		= document.querySelector('#payment-form button[type=submit]')!

			proxyNumberElement.value = proxyNumber
			
			paymentFormElement.click()

		} else {

			error = 'A fatal error has occurred. Please contact support.'

			console.error(`Zift Error | ${responseCode} | ${responseMessage}`)

			reportError({
				location	: 'proxynization',
				message		: responseMessage,
				error		: {code: responseCode, message: responseMessage}
			})

			buttonReset()

			return false
		}
	}

	const formSubmit = async () => {

		error = null

		const { password, error:passwordError } = await api.paymentInfoPassword()

		if (password) {

			// @ts-expect-error ProxynizationAPI is a global injected by external script
			ProxynizationAPI.password = password

			// @ts-expect-error ProxynizationAPI is a global injected by external script
			ProxynizationAPI.process('#account-number', 'clientCallback')
		
		} else {
			
			if (passwordError) {

				error = 'A fatal error has occurred. Please contact support.'
				
				reportError({
					location	: 'paymentInfoPassword',
					message		: passwordError.message,
					error		: passwordError
				})

			} else {

				error = 'An unknown error occured.'
				
				reportError({
					location	: 'paymentInfoPassword',
					message		: 'An unknown error occured.'
				})
			}

			buttonReset()

			return false
		}
	}

	const onSuccess = (paymentToken:any) => {

			user.set({paymentToken:{
				maskedNumber	: paymentToken.accountNumberMasked,
				expiration		: paymentToken.expiration,
				accountType		: paymentToken.extendedAccountType,
				holderName		: paymentToken.holderName,
				id				: paymentToken.id,
				userId			: paymentToken.userId
			}})
			
			modal.close()
	}

	$: if (formElement) { modal.formAlert(formElement, {

		type	: 'warning',
		message	: "You have unsaved changes. If you leave without saving you'll lose all your work. This cannot be undone."

	}).then(modal.close) }

</script>



<svelte:head>

	<script type="text/javascript" src={PUBLIC_ZIFT_PROXYNIZATION}></script>

</svelte:head>



<Container {label} closeButtonText="Cancel" {modal}>

	<Form id="payment-form" action="/account?/paymentTokenCreate" bind:element={formElement} {onSuccess} onFinal={buttonReset} {error}>

		<input type="hidden" id="proxy-number" name="proxyNumber" />
		
		{#if PUBLIC_ENV !== 'prod'}
			<strong>DEMO CARD INFO</strong>
		{/if}

		<input type="text" id="holder-name" name="holderName" bind:value={holderName} placeholder="Name on Card" autocomplete="cc-name" required />
		<input type="text" id="account-number" name="accountNumber" bind:value={accountNumber} placeholder="Card Number" autocomplete="cc-number" required on:click={(e) => format.creditCard(e, validateAccountNumber, true)} on:keydown={(e) => format.creditCard(e, validateAccountNumber, true)} on:paste={(e) => format.creditCard(e, validateAccountNumber, true)} on:input={(e) => format.creditCard(e, validateAccountNumber, true)} on:blur={(e) => format.creditCard(e, validateAccountNumber, true)} />
		<input type="text" id="expiration" name="expiration" bind:value={expiration} placeholder="Expiration Date (MM/YY)" autocomplete="cc-exp" required on:click={(e) => format.expiration(e, validateExpiration, true)} on:keydown={(e) => format.expiration(e, validateExpiration, true)} on:paste={(e) => format.expiration(e, validateExpiration, true)} on:input={(e) => format.expiration(e, validateExpiration, true)} on:blur={(e) => format.expiration(e, validateExpiration, true)} />

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!holderName || !validAccountNumber || !validExperation}>Save</Button>

</Container>