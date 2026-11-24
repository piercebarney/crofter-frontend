<script lang="ts">
	
	import { user } from 'src/stores/user'
	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'


	
	export let modal: any

	let formElement:	HTMLFormElement,
		formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		formChange:		boolean				= false

	const onSuccess = (userData:any) => {

		user.set(userData)
				
		modal.close()	
	}

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Edit Profile" closeButtonText="Cancel" {modal}>

	<Form action="/account?/userUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset}>

		<input type="hidden" name="id" value={$user.id} />

		<input type="text" name="firstName" placeholder="First Name" value={$user.firstName} autocomplete="given-name" required />
		<input type="text" name="lastName" placeholder="Last Name" value={$user.lastName} autocomplete="family-name" required />
		<input type="text" name="phoneNumber" placeholder="Phone Number" value={$user.phoneNumber} autocomplete="tel" required />
		<input type="email" name="email" placeholder="Email" value={$user.email} autocomplete="email" required />

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>
	
</Container>