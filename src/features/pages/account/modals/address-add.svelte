<script lang="ts">

	import type { Address } from 'src/types/address'

	import { user } from 'src/stores/user'
	import { company } from 'src/stores/company/store'
	import { companyRoles } from 'src/lists/company-roles'
	import { format } from 'src/lib/validate'
	import Container from 'src/features/modules/modal/container.svelte'
	import AddressesPotential from 'src/features/partials/addresses-potential.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Textarea from 'src/components/elements/textarea.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const data: any							= $modal.data
	const single: boolean					= data.single ?? false
	const select: boolean					= data.select ?? false
	const companyId: string|null|undefined	= data.companyId ?? null
	const companyRole: string|undefined		= data.companyRole ?? null

	let store							= user,
		action							= '/account?/addressAdd_user',
		force: boolean					= false,
		formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		style: string					= 'display:flex',
		formChange: boolean				= false,
		validate: boolean				= false,
		potentials: Address[]			= [],
		address: Address				= {
			address1				: '',
			address2				: '',
			city					: '',
			state					: '',
			zipCode					: '',
			deliveryInstructions	: ''
		}

	if (companyId) {
		
		store	= company.get(companyId)
		action	= '/account?/addressAdd_company'
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

	const onSuccess = (address:any = null) => {

		if (address.__typename == 'AddressValidationMatches') {

			potentials = address.potentialMatches

			validate = true

		} else {
			
			const selection	= address.id
		
			store.addressAdd(address)

			if (single) {

				const valid = address && address.address1 && address.city && address.state && address.zipCode ? true : false

				modal.set({data:{select, selection, valid}})
			}
	
			modal.close()
		}
	}

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

	$:	if (validate)	style = 'display:none'
		else			style = 'display:flex'

</script>



<Container label="Add Address" closeButtonText="Cancel" {modal}>

	<AddressesPotential {validate} {potentials} bind:address={address} {selection} />

	<Form {action} bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset} {style}>

		{#if companyId}

			<input type="hidden" name="companyId" value={companyId} />

			{#if companyRole == 'distributor'}

				<input type="hidden" name="type" value={companyRoles.id('distributor')} />

			{/if}

		{/if}

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