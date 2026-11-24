<script lang="ts">

	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'


	
	export let variables:	Record<string,any>|undefined
	export let error:		string|undefined

	let formSubmit:	(()=>boolean),
		formChange:	boolean			= false

</script>




<span class="title">FORGOT PASSWORD</span>

<div>

	<Form bind:submit={formSubmit} bind:change={formChange} {error} auth>

		<p>Enter your email address and if an associated account is found, a new password will be sent to you.</p>
		<input type="email" name="email" class="auth" placeholder="Email" value={variables?.email ?? ''} autocomplete="username" required />

	</Form>

	<Button {formSubmit} disabled={!formChange} c="auth-link" secondary>Send</Button>

</div>

<span>Don't have an account? <A route="signup" c="auth-link" hoverUnderline>Sign Up</A></span>
<span>Have an account? <A route="login" c="auth-link" hoverUnderline>Login</A></span>



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