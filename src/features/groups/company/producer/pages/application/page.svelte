<script lang="ts">

	import { onMount } from 'svelte'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import Brand from 'src/components/elements/brand.svelte'
	import A from 'src/components/elements/a.svelte'



	let route:	string|undefined	= undefined,
		href:	string|undefined	= undefined,
		show:	boolean				= false

	$:	 if ($application.completed)				route = 'application-products'
	else if (!$application.stages.second.completed)	route = 'shop-details'
	else if (application.depositAlertCheck())		href = '/application/payment-processing#deposit-details'
	else											route = 'payment-processing'

	onMount(() => setTimeout(() => show = true, (1 * 1000)))

</script>



<div class="wrapper-application" class:show-content={show}>
	<div class="logo" class:top={show}>
		<div>
		
			<Brand dark linkless />

		</div>
	</div>
	<div class="inner-wrapper" class:show={show}>
		<div class="content">
			
			{#if $application.completed}

				<span class="complete">Congratulations!<br />Your application has been submitted.</span>
				<span>Your application is being reviewd by <span><A href="https://zift.io/" target="_blank" application>Zift</A></span>, our payment processor. They will reach out to you for any additional information they may need. In the mean time, feel free to create listings for all of your products. As soon as your applincation is approved, your products will be made available for sale.</span>
				
			{:else}

				<span class="complete">Seller Application</span>
				<span>This application collects information about your business to use on our platform and for our payment processor <span><A href="https://zift.io/" target="_blank" application>Zift</A></span>. The information collected for <span><A href="https://zift.io/" target="_blank" application>Zift</A></span> allows them to collect payments from your customers and pay you directly. Crofter Market does not handle any payments and does not hold any of your funds.</span>
				<div class="rates">
					<span>Simplified Payment Card Rates</span>
					<ul>
						<li>12% + 30¢ per transaction</li>
						<li>$25.00 per chargeback</li>
						<li>No monthly fees</li>
						<li>No annual fees</li>
					</ul>
				</div>

			{/if}

			<div class="button">
				<div>
					<A {route} {href} role="button" application>Continue</A>
				</div>
			</div>
		</div>
	</div>
</div>



<style lang="sass">

	.wrapper-application
		position: relative
		display: flex
		flex-direction: column
		align-items: center
		min-height: 100%
		background: white
		z-index: 100

		.logo
			position: absolute
			top: 40%
			transform: translateY(-50%)
			width: 100%
			transition: all 1s cubic-bezier(0.4, 0, 0.2, 1)
			
			&.top
				top: 4rem
				transform: translateY(0)
				
				> div
					width: 50%
			
			> div
				margin: 0 auto
				width: 70%
				transition: width 1s cubic-bezier(0.4, 0, 0.2, 1)

		.inner-wrapper
			opacity: 0
			transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s
			margin-top: 14rem
			@include flex-col-top(4rem)
			
			&.show
				opacity: 1

			.content
				@include flex-col-top(4rem)

				div, span
					line-height: 1.2
					font-size: 1.5rem

					> span
						display: inline-block
						width: fit-content

				.complete
					text-align: center
					font-size: 2rem
					font-weight: 600

				.rates
					font-weight: 600
					line-height: 1.5

					ul

						li
							list-style-type: disc

				.button

					> div
						margin: 0 auto
						max-width: fit-content

	@media (min-width: #{breakpoint('md')})

		.wrapper-application
			padding: 4rem 0
			margin: 0 auto
			max-width: #{breakpoint('md')}

</style>