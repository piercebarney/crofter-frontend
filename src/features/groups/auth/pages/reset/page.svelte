<script lang="ts">

	import Form from 'src/components/elements/form.svelte'
	import InputPassword from 'src/components/elements/input-password.svelte'
	import Button from 'src/components/elements/button.svelte'
	// import A from 'src/components/elements/a.svelte'



	export let token:	string
	export let error:	string|undefined

	let formSubmit:	(()=>boolean),
		formChange:	boolean			= false

</script>



<span class="title">RESET PASSWORD</span>

<div>

	<Form bind:submit={formSubmit} bind:change={formChange} {error} auth>

		<span>Enter a new password for your account.</span>

		<input type="hidden" name="token" class="auth" value={token} />

		<InputPassword signup auth placeHolder="New Password" />

	</Form>

</div>

<Button {formSubmit} disabled={!formChange} c="auth-link" secondary>Reset</Button>

<!-- <span>Already have an account? <A route="login" c="auth-link">Sign In</A></span>
<span>Don't have an account? <A route="signup" c="auth-link">Sign Up</A></span> -->



<style lang="sass">

	:global(.auth-link)
		font-weight: 700

	.title
		font-size: 1.5rem
		font-weight: 900

	div
		width: 100%
		@include flex-col-center(2.5rem)

</style>