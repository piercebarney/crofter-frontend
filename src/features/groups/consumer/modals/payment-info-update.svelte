<script lang="ts">

	import type { PaymentToken } from 'src/types/payment'

	import { user } from 'src/stores/user'
	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const paymentToken:		PaymentToken	= $user.paymentToken
	// const caller:			string|null		= $modal.data?.caller ? $modal.data.caller : null
	const today:			Date			= new Date()
	const yyyy:				number			= today.getFullYear()
	const mm:				string			= String(today.getMonth() + 1).padStart(2, '0')
	const date:				string			= `${yyyy}-${mm}`
	const paymentTokenId					= paymentToken.id
	const holderName						= paymentToken.holderName
	const accountNumber						= `••••${paymentToken.maskedNumber.substring(paymentToken.maskedNumber.length-4, paymentToken.maskedNumber.length)}`

	let formElement:	HTMLFormElement,
		formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		formChange:		boolean				= false,
		expiration							= `20${paymentToken.expiration.slice(2,4)}-${paymentToken.expiration.slice(0,2)}`

	const onSuccess = (paymentToken:any) => {
		
		user.set({paymentToken})
			
		modal.close()		
	}

	$: if (formElement) { modal.formAlert(formElement).then(modal.close)}

</script>



<Container label="Edit Payment Info" closeButtonText="Cancel" {modal}>

	<Form action="/account?/paymentTokenUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset}>
		
		<input type="hidden" name="paymentTokenId" value={paymentTokenId} />
		<span>{holderName}</span>
		<span>{accountNumber}</span>
		<input type="month" name="expiration" placeholder="Expiration Date" bind:value={expiration} min={date} autocomplete="cc-exp" required />

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>

</Container>



<style lang="sass">

	input[type="month"]
		position: relative

	/* make the native arrow invisible and stretch it over the whole field so you can click anywhere in the input field to trigger the native datepicker*/
	input[type="month"]::-webkit-calendar-picker-indicator
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0
		width: auto
		height: auto
		color: transparent
		background: transparent

	/* adjust increase/decrease button */
	input[type="month"]::-webkit-inner-spin-button 
		z-index: 1

	/* adjust clear button */
	input[type="month"]::-webkit-clear-button
		z-index: 1

</style>