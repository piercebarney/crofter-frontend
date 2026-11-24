<script lang="ts">

	import { PUBLIC_API_URL, PUBLIC_SECURE_COOKIES } from '$env/static/public'
	import Form from 'src/components/elements/form.svelte'
	import InputPassword from 'src/components/elements/input-password.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let action: ((value:any,type:string)=>void)

	let formElement:	HTMLFormElement,
		formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		formChange:		boolean				= false

	const onSuccess = (resultData:any) => action(resultData, 'login')

	const handleAuth0Login = () => {

		// set cookie AuthRedirect to /checkout
		const secure = PUBLIC_SECURE_COOKIES === 'true' ? '; Secure' : ''
		const maxAge = 60 * 60 // 1 hour
		document.cookie = `AuthRedirect=${encodeURIComponent('/checkout?sso=true')}; Path=/; Max-Age=${maxAge}${secure}; SameSite=Lax`

		window.location.href = `${PUBLIC_API_URL}/auth/user/auth0?return_url=${encodeURIComponent(window.location.origin)}`
	}

</script>



<Button action={handleAuth0Login} tall>
	
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

<Form action="/auth?/login" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset}>

	<input type="email" name="email" placeholder="Email" autocomplete="username" required />

	<InputPassword />

</Form>

<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange} secondary>Sign In</Button>



<style lang="sass">

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

</style>