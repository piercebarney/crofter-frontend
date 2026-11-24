<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import InputPassword from 'src/components/elements/input-password.svelte'
	import Button from 'src/components/elements/button.svelte'


	export let modal: any

	let formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		formChange:		boolean			= false

</script>



<Container label="Change Password" closeButtonText="Cancel" {modal}>

	<Form action="/account?/passwordUpdate" bind:submit={formSubmit} bind:change={formChange} onSuccess={modal.close} onFinal={buttonReset}>

		<InputPassword name="oldPassword" placeHolder="Current Password" />

		<InputPassword name="newPassword" placeHolder="New Password" signup />

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>

</Container>