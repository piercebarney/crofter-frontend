<script lang="ts">

	import { goto } from '$app/navigation'
	import { layout } from 'src/stores/layout'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import { routes } from 'src/lists/routes'
	import Brand from 'src/components/elements/brand.svelte'
	import ApplicationSteps from 'src/components/units/application-steps/unit.svelte'
	import ProgressBar from 'src/components/elements/progress-bar.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'



	export let name:		string
	export let routeName:	string
	export let open:		boolean
	export let inReview:	boolean
	export let company:		any

	let formSubmit:		(()=>boolean),
		buttonReset:	(()=>void),
		buttonLoading:	boolean		= false,
		alert:			boolean		= false

	const onSuccess = (data:any) => {
		
		buttonLoading = false

		company.merchantApplicationStatusUpdate(data)

		application.complete()

		goto(routes.pathname('application'))
	}

	const action = () => {

		open = false

		layout.set({overlay:open ? 'nav' : null})
	}

	$: secondCompleted	= $application.stages.second.completed
	$: secondPercent	= $application.stages.second.steps.percent
	$: thirdCompleted	= $application.stages.third.completed
	$: thirdPercent		= $application.stages.third.steps.percent
	$: stepsCompleted	= $application.steps.completed
	$: stepsTotal		= $application.steps.total
	$: companyId		= company ? company.get('id') : null

	$: {

		$application.stages.third

		alert = application.depositAlertCheck()
	}

</script>



<div class="wrapper">
	<div class="header">

		<Brand dark />

	</div>
	<div class="nav">

		<ApplicationSteps {name} {routeName} {inReview} bind:open>

			<sapn slot="shop-details">
				
				{#if inReview}

					Complete - Under Review

				{:else if secondCompleted}

					Complete

				{:else}

					{secondPercent} Complete

				{/if}

			</sapn>
			<sapn slot="products">Not required</sapn>
			<sapn slot="payment-processing">
				
				{#if inReview}

					Complete - Under Review

				{:else if thirdCompleted}

					Complete

				{:else}

					{thirdPercent} Complete

				{/if}

			</sapn>	

		</ApplicationSteps>

	</div>
	<div class="footer">

		{#if inReview}

			<div class="sub-footer">
				<span>Your application has been submitted for review. You can expect to be contactaed by <span><A href="https://zift.io/" target="_blank" application>Zift</A></span> during the review process.</span>
			</div>

		{:else}

			<Form action="/account?/applicationSubmit" bind:submit={formSubmit} {onSuccess} onFailure={buttonReset} application>

				<input type="hidden" name="companyId" value={companyId} />
				<input type="hidden" name="bankName" value={$application.deposit.bankName} />
				<input type="hidden" name="holderName" value={$application.deposit.holderName} />
				<input type="hidden" name="accountType" value={$application.deposit.accountType} />
				<input type="hidden" name="accountNumber" value={$application.deposit.accountNumber} />
				<input type="hidden" name="routingNumber" value={$application.deposit.routingNumber} />

				<div class="sub-footer">
					<span>You must complete shop details and payment processing before submitting for review.</span>

					{#if alert}

						<span class="alert"><A href="/application/payment-processing#deposit-details" {action} application>Complete your deposit details to submit the application</A></span>

					{/if}

					<div class="buttons">
						<div>
				
							<ProgressBar stage={stepsCompleted} total={stepsTotal}/>

						</div>

						{#if routeName != 'deposit-details'}

							<div>
								
								<Button {formSubmit} bind:reset={buttonReset} disabled={!secondCompleted || !thirdCompleted} loading={buttonLoading} application>Submit</Button>

							</div>

						{/if}
						
					</div>
				</div>
				
			</Form>

		{/if}

		<span class="help"><A href="mailto:support@croftermarket.com" application>Need help?</A></span>
	</div>

</div>



<style lang="sass">

	:global(.producer-layout-nav-link-wrapper a)
		padding: 1.5rem

	:global(.producer-layout-nav-link-wrapper.active a)
			cursor: default	

	.wrapper
		overflow: auto
		padding: 2rem 1rem 1rem
		background-color: #FBF9F6
		@include flex-col(2rem) // @include flex-col(1.5rem)
		@include fill
		// @include border(red)

		.header
			flex-grow: 0
			width: 40% // width: 12rem

		.footer
			flex-grow: 0
			@include flex-col(1rem)
			// @include border(green, 1px)


			.sub-footer
				padding: 1.5rem
				background-color: #FFFFFF
				border-radius: var(--pico-border-radius)
				@include flex-col(1.5rem)

				span
					display: inline-block
					width: fit-content
					font-size: 1.25rem
					line-height: 1.2
					color: var(--cm-text-secondary)

				.buttons
					align-items: center
					@include flex-col-center(1.5rem) // @include flex-col-center(2rem)

					> div
						width: 100%

					> div:last-child
						flex-grow: 0
						min-width: fit-content

		.help
			flex-grow: 0
			width: fit-content


	@media (min-width: #{breakpoint('sm')})

		.wrapper
			padding: 3rem 2rem 2rem
			// @include border(blue)

			.footer

				.sub-footer

					.buttons
						@include flex-row(1.5rem) // @include flex-row(2rem)


	@media (min-width: #{breakpoint('md')})

		.wrapper
			padding: 3rem 2rem 2rem
			// @include border(green)

			.footer

				.sub-footer

					// span
					// 	font-size: 1.35rem

					.buttons
						@include flex-col-center(1.5rem) // @include flex-col-center(2rem)


	@media (min-width: #{breakpoint('lg')})

		.wrapper
			// @include border(purple)

			.footer

				.sub-footer

					span
						font-size: 1.25rem

					.buttons
						@include flex-row(1.5rem) // @include flex-row(2rem)

	
	@media (min-width: #{breakpoint('xl')})

		.wrapper
			padding: 4rem 3rem 3rem // padding: 7.5rem 3rem 3rem
			// @include border(yellow)

			.footer

				.sub-footer

					span
						font-size: 1.35rem

</style>