<script lang="ts">

	import type { Address } from 'src/types/address'

	import { user } from 'src/stores/user'
	import { company } from 'src/stores/company/store'
	import { api } from 'src/lib/api'
	import { format } from 'src/lib/validate'
	import Container from 'src/features/modules/modal/container.svelte'
	import AddressesPotential from 'src/features/partials/addresses-potential.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Textarea from 'src/components/elements/textarea.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const addressId: string					= $modal.data?.addressId
	const companyId: string|null|undefined	= $modal.data?.companyId

	let store							= user,
		force: boolean					= false,
		formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		style: string					= 'display:flex',
		formChange: boolean				= false,
		validate: boolean				= false,
		potentials: Address[]			= []

	if (companyId) store = company.get(companyId)

	const storeAddress:Address = $store.addresses.filter((a:Address) => a.id == addressId)[0]

	let address: Address = {
		address1				: storeAddress.address1,
		address2				: storeAddress.address2,
		city					: storeAddress.city,
		state					: storeAddress.state,
		zipCode					: storeAddress.zipCode,
		deliveryInstructions	: storeAddress.deliveryInstructions
	}

	const selection = (type:string, potential:Address|null) => {

		if (type == 'new') {

			formChange	= false
			validate	= false

			buttonReset()

		} else new Promise((resolve) => {

			if (potential) address = {...potential, deliveryInstructions:address.deliveryInstructions}
			
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

	const onSuccess = (address:any) => {

		if (address.__typename == 'AddressValidationMatches') {
			
			potentials = address.potentialMatches

			validate = true
		
		} else {
		
			store.addressUpdate(address)
	
			modal.close()
		}	
	}

	const onDelete = () => modal.alert({
			
		type	: 'danger',
		message	: "You are about to delete an address. This cannot be undone."

	}).then( async () => {

		const { success } = await api.addressDelete({ variables:{addressId} })

		if (success) store.addressDelete(addressId)

		modal.close()
	})

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

	$:	if (validate)	style = 'display:none'
		else			style = 'display:flex'

</script>



<Container label="Edit Address" closeButtonText="Cancel" {modal} onDelete={!storeAddress.isDefault ? onDelete : null}>

	<AddressesPotential {validate} {potentials} bind:address={address} {selection} />

	<Form action="/account?/addressUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset} {style}>
		
		<input type="hidden" name="addressId" value={addressId} />
		<input type="hidden" name="force" value={force} />
		<input type="text" name="address1" placeholder="Street Address" bind:value={address.address1} autocomplete="address-line1" required />
		<input type="text" name="address2" placeholder="Street Address 2" bind:value={address.address2} autocomplete="address-line2" />
		<input type="text" name="city" placeholder="City" bind:value={address.city} autocomplete="address-level2" required />
		
		<Select list="states" bind:value={address.state} />

		<input type="text" name="zipCode" placeholder="Zip Code" bind:value={address.zipCode} on:click={format.zipCode} on:keydown={format.zipCode} on:blur={format.zipCode} autocomplete="postal-code" required />

		{#if !companyId}

			<Textarea name="deliveryInstructions" placeholder="Delivery Instructions" rows={2} maxlength={255} bind:value={address.deliveryInstructions} />
		
		{/if}

	</Form>

	<div {style}>
	
		<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>

	</div>

</Container>