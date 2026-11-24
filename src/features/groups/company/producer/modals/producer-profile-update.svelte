<script lang="ts">

	import { company as c } from 'src/stores/company/store'
	import { user } from 'src/stores/user'
	import { imageUpload } from 'src/features/modules/image-upload/store'
	import Container from 'src/features/modules/modal/container.svelte'
	import ImageUpload from 'src/components/units/image-upload/unit.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Textarea from 'src/components/elements/textarea.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	modal.onClose(imageUpload.clear)

	const company = c.get($modal.data.companyId)

	let formElement:	HTMLFormElement,
		formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		error:			string|null,
		formChange:		boolean				= false

	const onSuccess = (companyData:any) => {

		company.set(companyData)

		user.companyUpdate(companyData)

		modal.close()		
	}

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

	$: if ($imageUpload.status.error) error = $imageUpload.status.error

</script>



<Container label="Edit Producer Profile" closeButtonText="Cancel" {modal}>

	<div class="image">

		<ImageUpload {formElement} src={$company.image} />

	</div>

	<Form action="/account?/companyUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset} {error}>

		<input type="hidden" name="companyId" value={$company.id} />
		<input type="text" name="name" placeholder="Name" value={$company.name} autocomplete="organization" required />
		<input type="text" name="phoneNumber" placeholder="Phone Number" value={$company.phoneNumber} autocomplete="tel" />
		<input type="email" name="email" placeholder="Email" value={$company.email} autocomplete="email" required />
		<input type="text" name="operatingHours" placeholder="Operating Hours" value={$company.operatingHours} />
		
		<Textarea name="bio" placeholder="Bio" value={$company.bio} rte />

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>
	
</Container>