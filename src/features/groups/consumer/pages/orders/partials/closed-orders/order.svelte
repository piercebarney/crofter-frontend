<script lang="ts">

	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'


	
	export let order: any

	$: isMobile = $layout.isMobile

</script>




<Button modal="order-details" data={{orderId:order.id}} c="order-button-wrapper cm-list-item" wrapper>

	<div class="details">
		<div>
			<span class="date">{order.date}</span>

			{#if !isMobile}

				<span class="id">Order ID: {order.idShortHand}</span>

			{/if}

		</div>
		<span class="total">{order.total.string}</span>

		{#if isMobile}

			<span class="id">{order.idShortHand}</span>

		{/if}

	</div>

</Button>


<style lang="sass">

	:global(.order-button-wrapper)
		width: 100%

	.details
		padding: 1rem
		@include flex-col(.5rem)

		> div
			@include flex-row-middle(.5rem)

			.date
				font-size: 1.2rem
				font-weight: 600

		.id
			font-size: .8rem

		.total
			font-size: 1.2rem
			font-weight: 600

	.details:hover
		background-color: var(--cm-utility-highlight)


	@media (min-width: #{breakpoint('sm')})

		.details
			@include flex-row-between(1rem)
		
</style>