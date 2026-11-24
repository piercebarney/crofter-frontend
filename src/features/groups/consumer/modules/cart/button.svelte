<script lang="ts">

	import { layout as l } from 'src/stores/layout'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	const action = () => l.set({overlay:$l.overlay != 'cart' ? 'cart' : null})

	$: isDesktop	= $l.isDesktop
	$: cartCount	= $c.count
	$: subTotal		= $c.subTotal?.string || '$0.00'

</script>



<Button {action} c="cart-button-wrapper" wrapper >

	<div class="icon-wrapper">
		<div class="icon">
			<div>
				<span>

					<Icon name="cart" size="1.75rem" />

					{#if cartCount > 0}
					
						<span class="badge">{cartCount}</span>

					{/if}

				</span>
			</div>
		</div>

		{#if !isDesktop && subTotal}
		
			<span class="amount">{subTotal}</span>

		{/if}

	</div>

	{#if isDesktop}

		<div class="amount-wrapper">
			<span class="title">Cart</span>

			{#if subTotal}
			
				<span class="amount">{subTotal}</span>

			{/if}

		</div>

	{/if}

</Button>



<style lang="sass">

	:global(.cart-button-wrapper)
		@include flex-row

	.icon-wrapper		
		margin-top: 2px
		height: 2.8334rem
		padding: 0 calc(var(--cm-nav-element-spacing) / 2)
		@include flex-col

		.icon
			position: relative
			// min-height: 2rem
			min-width: 2rem
			// width: 100%
			stroke: #fff

			div
				@include absolute-middle-center
				@include area(2rem)

				span
					position: relative
					display: block

					.badge						
						top: -.25rem
						right: -.5rem						
						border-radius: .75rem
						background-color: var(--cm-nav-background-inverse)
						color: var(--cm-nav-text-inverse)
						text-align: center
						line-height: 1.25rem
						font-size: 1rem
						@include absolute-top-right
						@include area(1.25rem)

		.amount
			flex-grow: 0

		.amount
			font-size: .75rem

	.amount-wrapper
		@include flex-col-middle-left

		.title
			font-size: .75rem

		.amount
			font-size: 1.25rem

	@media (min-width: #{breakpoint('lg')})

		.icon-wrapper
			padding-left: 2px

		.amount-wrapper
			padding-right: 2px

</style>