<script lang="ts">

	import Container from 'src/features/groups/consumer/pages/checkout/container.svelte'
	import A from 'src/components/elements/a.svelte'



	export let order: number
	export let index: number

</script>



<Container {order} bind:index>
	
	<div>
		<span>Thank You!</span>
		<span>Your order has been placed.</span>

		<A route="home" c="inverse">Continue Shopping</A>

	</div>

</Container>



<style lang="sass">

	div
		@include flex-col-center(1rem)

		span:nth-child(1)
			font-weight: 700
			font-size: 2rem

		span:nth-child(2)
			font-weight: 300

	@media (min-width: #{breakpoint('sm')})

		div

			span:nth-child(1)
				font-size: 3rem

			span:nth-child(2)
				font-size: 2rem

</style>