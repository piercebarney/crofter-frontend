<script lang="ts">

	import { user as u } from 'src/stores/user'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { storage as s } from 'src/lib/storage'
	import { account as a } from 'src/features/pages/account/store'
	import { gA4 } from 'src/lib/gA4'
	import Container from 'src/features/groups/consumer/pages/checkout/container.svelte'
	import SignUp from 'src/features/groups/consumer/pages/checkout/segments/auth/partials/sign-up.svelte'
	import Login from 'src/features/groups/consumer/pages/checkout/segments/auth/partials/login.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'



	export let order: number
	export let index: number

	let showSignUp: boolean			= true,
		previousLoggingIn: boolean	= false

	const auth = async (userData:any, type:string) => {

		// console.log('auth', {userData, type})

		u.set(userData)

		s.init(userData.id)

		a.setActive(`consumer:${userData.id}`, false)

		c.refresh()

		await c.whenSynchronized()

		if		(type === 'login')	gA4.checkoutLogIn()
		else if	(type === 'signup')	gA4.checkoutSignUp()

		index++
	}

	$: loggingIn = index === order

	$: loggingIn, (() => {

		if (loggingIn && !previousLoggingIn) gA4.checkoutAuth()

		previousLoggingIn = loggingIn

	})()

</script>



<Container {order} bind:index>
		
	<div id="auth-wrapper">

		{#if showSignUp}

			<div>

				<SignUp action={auth} />

				<p>Already have an account? <Button action={() => {showSignUp = !showSignUp}} c="inverse" role="link">Login</Button></p>

			</div>

		{:else}

			<div>

				<Login action={auth} />

				<p>Don't have an account? <Button action={() => {showSignUp = !showSignUp}} c="inverse" role="link">Sign Up</Button></p>
				<p><A route="forgot" c="inverse">Forgot Password</A></p>
			</div>

		{/if}

	</div>

</Container>



<style lang="sass">

	#auth-wrapper
		margin:	0 auto
		width: 100%
		max-width: #{breakpoint('sm')}

		> div
			@include flex-col-center(2rem)

</style>