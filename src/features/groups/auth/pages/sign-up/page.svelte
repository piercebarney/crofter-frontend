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



<!-- <span class="title">Create Account</span> -->

<Button action={handleAuth0Login} secondary tall>
	
	<div class="sso-button-inner-wrapper">
		<span>Sign Up with</span>

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
		
		<input type="text" name="firstName" class="auth" placeholder="First Name" value={variables?.firstName ?? ''} autocomplete="given-name" />
		<input type="text" name="lastName" class="auth" placeholder="Last Name" value={variables?.lastName ?? ''} autocomplete="family-name" />
		<input type="text" name="phoneNumber" class="auth" placeholder="Phone Number" value={variables?.phoneNumber ?? ''} autocomplete="tel-national" />
		<input type="email" name="email" class="auth" placeholder="*Email" value={variables?.email ?? ''} autocomplete="email" required />
		<input type="text" name="zipCode" class="auth" placeholder="*Zip Code" value={variables?.zipCode ?? ''} autocomplete="postal-code" required />
		
		<InputPassword signup auth />
		
		<label for="terms" class="auth auth-terms">
			<input type="checkbox" id="terms" name="terms" class="auth" required>
			<div>
				<span>I have read and agree to the</span>
				<br />

				<Button modal="terms" type="button" role="link" c="auth-link" hoverUnderline>Terms and Conditions</Button>

			</div>
		</label>

	</Form>

	<Button {formSubmit} disabled={!formChange} c="auth-link" secondary>Sign Up</Button>

</div>
<span>Already have an account? <A route="login" c="auth-link" hoverUnderline>Sign In</A></span>



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

		.auth-terms
			font-size: 1.5rem
			@include flex-row-middle(.75rem)

			> *
				margin: 0
			
</style>