<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import Icon from 'src/components/elements/icon/element.svelte'
	import A from 'src/components/elements/a.svelte'
	import Item from 'src/components/units/application-steps/partials/item.svelte'



	export let name:		string
	export let routeName:	string|null	= null
	export let nav:			boolean		= true
	export let inReview:	boolean		= false
	export let open:		boolean		= false

	const action = () => {

		open = false

		layout.set({overlay:open ? 'nav' : null})
	}

	$: secondCompleted	= $application.stages.second.completed || inReview
	$: thirdCompleted	= $application.stages.third.completed || inReview

	$: stage2 = {
		completed	: secondCompleted,
		classes		: secondCompleted ? 'step done' : nav ? 'step' : ''
	}

	$: stage3 = {
		completed	: thirdCompleted,
		classes		: thirdCompleted ? 'step done' : nav ? 'step' : ''
	}

</script>



<div class="wrapper">
	<div class="label">
		<span>Welcome, {name}</span>

		{#if inReview}

			<span>Congratulations! Your application has been submitted. While awaiting approval, you can create and manage your products.</span>

		{:else}

			<span>We're excited to get started. Below is a breakdown of the next steps to get your shop up and running.</span>

		{/if}

	</div>
	<div class="steps">
		<div>
			<div class="path">
				<div>
					<div class={stage2.classes}>
						<div>
							
							{#if stage2.completed}

								<Icon name="check" size=".8rem" />

							{/if}

						</div>
					</div>
				</div>
				<div></div>
			</div>

			{#if nav}

				<A route="shop-details" {action} c="producer-application-steps-button" wrapper>

					<Item icon="shop" title="Shop Details" active={routeName == 'shop-details'} link>

						<slot name="shop-details" />

					</Item>

				</A>

			{:else}

				<div>

					<Item icon="shop" title="Shop Details">

						<slot name="shop-details" />

					</Item>

				</div>

			{/if}

		</div>
		<div>
			<div class="path">
				<div>
					<div></div>
				</div>
				<div></div>
			</div>

			{#if nav}

				<A route="application-products" {action} c="producer-application-steps-button" wrapper>

					<Item icon="list" title="Products" active={routeName !== null && routeName.includes('application-product')} link>

						<slot name="products" />

					</Item>

				</A>

			{:else}

				<div>

					<Item icon="list" title="Products">

						<slot name="products" />

					</Item>

				</div>

			{/if}

		</div>
		<div>
			<div class="path">
				<div>
					<div class={stage3.classes}>
						<div>
						
							{#if stage3.completed}
							
								<Icon name="check" size=".8rem" />

							{/if}
						
						</div>
					</div>
				</div>
				<div></div>
			</div>

			{#if nav}

				<A route="payment-processing" {action} c="producer-application-steps-button" wrapper>

					<Item icon="card" title="Payment Processing" active={routeName == 'payment-processing'} link>

						<slot name="payment-processing" />

					</Item>

				</A>

			{:else}

				<div>

					<Item icon="card" title="Payment Processing">

						<slot name="payment-processing" />

					</Item>

				</div>

			{/if}

		</div>
	</div>
</div>



<style lang="sass">

	:global(.producer-application-steps-button)
		flex-grow: 1

	.wrapper
		@include flex-col-top(2rem) // @include flex-col-top(3rem)
		// @include border(black, 1px)

		span
			display: inline-block
			width: fit-content

		.label

			> span
				display: block

				&:first-child
					margin-bottom: 1.5rem
					font-size: 2rem
					font-weight: 600

				&:last-child
					font-size: 1.25rem
					font-weight: 400
					line-height: 1.2
					color: var(--cm-text-secondary)

		.steps
			@include flex-col

			> div
				@include flex-row(.5rem)

				.path
					flex-grow: 0
					@include flex-col-center

					> div:first-child
						flex-grow: 0
						padding: 1rem 0 .5rem

						> div
							position: relative
							border: 2px solid black
							border-radius: 50%
							background-color: black
							@include area(1.15rem)

							&.step
								background-color: #FBF9F6

							&.done
								border: 2px solid #468047
								background-color: #468047

							> div
								stroke: #FFFFFF
								stroke-width: 3
								top: 40% !important
								@include absolute-middle-center

					> div:last-child
						margin-bottom: -.5rem
						width: 3px
						background-color: var(--cm-text-secondary)

			> div:last-child
				
				.path

					> div:last-child
						background-color: transparent


	@media (min-width: #{breakpoint('sm')})

		.wrapper
			// gap: 4rem

			.steps

				> div
					gap: 1rem


	@media (min-width: #{breakpoint('md')})

		.wrapper

			.label

				> span

					// &:first-child
					// 	font-size: 2.5rem

					// &:last-child
					// 	font-size: 1.35rem

			.steps

				> div
					gap: .5rem


	@media (min-width: #{breakpoint('lg')})

		.wrapper
			gap: 3rem // gap: 4.5rem

			.label

				> span

					&:first-child
						font-size: 2rem

					&:last-child
						font-size: 1.25rem

			.steps

				> div
					gap: 1rem


	@media (min-width: #{breakpoint('xl')})

		.label
			
			> span

				&:first-child
					font-size: 2.5rem
				
				&:last-child
					font-size: 1.35rem

</style>