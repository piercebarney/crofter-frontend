<script lang="ts">

	import { company as c } from 'src/stores/company/store'
	import { user } from 'src/stores/user'
	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company = c.get($modal.data.companyId)

	let formElement:	HTMLFormElement,
		formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		formChange:		boolean				= false

	const onSuccess = (companyData:any) => {

		company.set(companyData)

		user.companyUpdate(companyData)

		modal.close()		
	}

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Edit Distributor Profile" closeButtonText="Cancel" {modal}>

	<Form action="/account?/companyUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset}>

		<input type="hidden" name="companyId" value={$company.id} />
		<input type="text" name="name" placeholder="Name" value={$company.name} autocomplete="organization" required />
		<input type="text" name="phoneNumber" placeholder="Phone Number" value={$company.phoneNumber} autocomplete="tel" />
		<input type="email" name="email" placeholder="Email" value={$company.email} autocomplete="email" required />

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>
	
</Container>