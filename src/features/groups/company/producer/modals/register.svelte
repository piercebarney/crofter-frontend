<script lang="ts">

	import type { Address } from 'src/types/address'

	import { user } from 'src/stores/user'
	import { account } from 'src/features/pages/account/store'
	import Container from 'src/features/modules/modal/container.svelte'
	import AddressesPotential from 'src/features/partials/addresses-potential.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	let force: boolean					= false,
		formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		style: string					= 'display:flex',
		formChange: boolean				= false,
		validate: boolean				= false,
		potentials: Address[]			= [],
		address: Address				= {
			address1	: '',
			address2	: '',
			city		: '',
			state		: '',
			zipCode		: ''
		}

	// const selection = (type:string, potential:Address|null) => {

	// 	validate = false

	// 	if (type == 'new') {

	// 		formChange = false

	// 		buttonReset()

	// 	} else {

	// 		if	(potential) address	= potential
	// 		else			force	= true
	// 	}

	// 	return true
	// }

	const selection = (type:string, potential:Address|null) => {

		if (type == 'new') {

			formChange	= false
			validate	= false

			buttonReset()

		} else new Promise((resolve) => {

			if (potential) address = potential
			
			force = true

			resolve(true)
		
		})
		.then(() => formSubmit())
		.then(() => {
			
			const elements: NodeListOf<HTMLButtonElement> = document.querySelectorAll('button.selection-button')

			for (const e of elements) if (!e.disabled) e.style.display = 'none'
		})

		return true
	}

	const onSuccess = (companyData:any) => {

		if (companyData.__typename == 'AddressValidationMatches') {
			
			potentials = companyData.potentialMatches

			validate = true
		
		} else {

			user.companyAdd(companyData)

			account.setActive(`producer:${companyData.id}`)

			modal.close()
		}
	}

	$: if (formElement) {modal.formAlert(formElement).then(modal.close)}

	$:	if (validate)	style = 'display:none'
		else			style = 'display:flex'

</script>



<Container label="Seller Registration" closeButtonText="Cancel" {modal}>

	<AddressesPotential {validate} {potentials} bind:address={address} {selection} label="Select" />

	<p {style}>Register here to sell your edible products on Crofter Market.</p>

	<Form action="/account?/companyCreate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset} {style}>

		<input type="hidden" name="addressForce" value={force} />
		<input type="text" name="name" placeholder="*Company / Production Name" autocomplete="organization" required />
		<input type="text" name="phoneNumber" placeholder="*Phone Number" autocomplete="tel-national" />
		<input type="email" name="email" placeholder="*Email" autocomplete="email" required />
		<input type="text" name="address_address1" placeholder="*Street Address" on:change={() => force = false} bind:value={address.address1} autocomplete="address-line1" required />
		<input type="text" name="address_address2" placeholder="Street Address 2" on:change={() => force = false} bind:value={address.address2} autocomplete="address-line2" />
		<input type="text" name="address_city" placeholder="*City" on:change={() => force = false} bind:value={address.city} autocomplete="address-level2" required />

		<Select list="states" name="address_state" placeholder="*State" on:change={() => force = false} bind:value={address.state} required />

		<input type="text" name="address_zipCode" placeholder="*Zip Code" on:change={() => force = false} bind:value={address.zipCode} autocomplete="postal-code" required />

	</Form>

	<div {style}>

		<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Register</Button>

	</div>

</Container>