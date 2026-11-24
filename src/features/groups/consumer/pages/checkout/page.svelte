<script lang="ts">

	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page as p } from '$app/state'
	import { user as u } from 'src/stores/user'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { gA4 } from 'src/lib/gA4'
	import Auth from 'src/features/groups/consumer/pages/checkout/segments/auth/segment.svelte'
	import PlaceOrder from 'src/features/groups/consumer/pages/checkout/segments/place-order/segment.svelte'
	import ThankYou from 'src/features/groups/consumer/pages/checkout/segments/thank-you.svelte/segment.svelte'
	import LoaderLines from 'src/components/loaders/lines.svelte'



	let index: number = $u.id ? 1 : 0

	$: display = $c.checkout

	onMount(() => {

		if (p.url.searchParams.get('sso')) {
			
			// Check if user is new (created within last 60 seconds)
			const insertedAt			= new Date($u.insertedAt)
			const now					= new Date()
			const secondsSinceCreation	= (now.getTime() - insertedAt.getTime()) / 1000
			const isNewUser				= secondsSinceCreation <= 60
			
			if	(isNewUser)	gA4.checkoutSignUp()
			else			gA4.checkoutLogIn()
		
			goto(p.url.pathname, { replaceState:true, noScroll:true, keepFocus:true })
		}
	})

</script>



{#if display}

	<div class="checkout-wrapper container">

		<Auth order={0} bind:index />

		<PlaceOrder order={1} bind:index />

		<ThankYou order={2} bind:index />

	</div>

{:else}

	<div class="checkout-wrapper container">
		<div class="loader">

			<LoaderLines />

			<span style="display:contents"></span>
		</div>
	</div>

{/if}


<style lang="sass">

	.checkout-wrapper
		margin-top: 3rem
		margin-bottom: 3rem

		.loader
			margin: 0 auto
			max-width: #{breakpoint('sm')}
			@include flex-col(1rem)

</style>