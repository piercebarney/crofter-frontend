<script lang="ts">

	import { PUBLIC_API_URL } from '$env/static/public'
	import Form from 'src/components/elements/form.svelte'
	import InputPassword from 'src/components/elements/input-password.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let variables:	Record<string,any>|undefined
	export let error:		string|undefined

	let formSubmit:	(()=>boolean),
		formChange:	boolean			= false

	const handleAuth0Login = () => window.location.href = `${PUBLIC_API_URL}/auth/user/auth0?return_url=${encodeURIComponent(window.location.origin)}`

</script>



<!-- <span class="title">Account Login</span> -->

<Button action={handleAuth0Login} secondary tall>
	
	<div class="sso-button-inner-wrapper">
		<span>Sign In with</span>

		<Icon name="apple" size="2rem"/>

		<Icon name="google" size="2rem"/>

		<!-- <Icon name="facebook" size="2rem"/> -->

	</div>

</Button>

<div class="divider">
	<span class="title">OR</span>
</div>
<div class="form-wrapper">

	<Form bind:submit={formSubmit} bind:change={formChange} {error} auth>

		<input type="email" name="email" placeholder="Email" value={variables?.email ?? ''} autocomplete="username" class="auth" required />

		<InputPassword auth />

		<A route="forgot" hoverUnderline>Trouble signing in?</A>

	</Form>
	
	<Button {formSubmit} disabled={!formChange} secondary c="sign-in-btn"><span class="sign-in-text">Sign In</span></Button>

</div>
<span>Don't have an account? <A route="signup" c="auth-link" hoverUnderline>Sign Up</A></span>



<style lang="sass">

	:global(.auth-link)
		font-weight: 700

	.sso-button-inner-wrapper
		flex-grow: 0
		width: fit-content
		background-color: transparent
		@include flex-row-middle(.5rem)

		span
			font-size: 1.5rem

	.divider
		position: relative
		width: 100%
		text-align: center
		@include flex-col-center(2.5rem)
		
		&::before, &::after
			content: ''
			position: absolute
			top: 50%
			width: calc(50% - 4rem)
			height: 3px
			background: rgba(0, 0, 0, 0.2)
		
		&::before
			left: 0
		
		&::after
			right: 0

	.title
		font-size: 1.5rem
		font-weight: 900

	.form-wrapper		
		width: 100%
		@include flex-col-center(2.5rem)
	

</style>