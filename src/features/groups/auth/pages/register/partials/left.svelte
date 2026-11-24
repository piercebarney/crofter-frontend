<script lang="ts">

	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import Brand from 'src/components/elements/brand.svelte'
	import ProgressBar from 'src/components/elements/progress-bar.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let index:		number
	export let formSubmit:	(()=>boolean)
	export let disabled:	boolean
    export let loading:		boolean
    export let formChange:	boolean

	const onNext = () => {

		index++

		application.updateSteps('first', 1)
	}
	
</script>



<div class="wrapper">
	<div>
		<div class="logo">
			
			<Brand dark small linkless/>
		
		</div>
		<div class="left-body-wrapper">

			<slot />
		
		</div>
	</div>
	<div class="buttons">
		<div>

			<ProgressBar stage={$application.steps.completed} total={$application.steps.total}/>

		</div>
		<div>

			{#if index == 1}

				<Button action={onNext} {disabled} {loading} application>Continue</Button>

			{:else if index == 2}

				<Button {formSubmit} disabled={!formChange} {loading} application>Continue</Button>

			{/if}

		</div>
	</div>
</div>



<style lang="sass">

	.wrapper
		@include fill
		@include flex-col-between

		> div:first-child
			padding-top: 1.5rem
			overflow: auto
			@include fill
			@include flex-col(2.5rem)

			.logo
				width: 16rem
				padding: 0 1.5rem

			.left-body-wrapper
				padding: 0 1.5rem
				@include fill

		.buttons
			position: relative
			z-index: 10
			padding: 1.5rem
			border-top: 1px solid #EFEFEF
			align-items: center
			background-color: #FFFFFF
			@include flex-col(2rem)

			> div
				flex-grow: 0
				width: 100%


	@media (min-width: #{breakpoint('sm')})

		.wrapper

			> div:first-child
				padding-top: 3rem

				.logo
					padding: 0 3rem

				.left-body-wrapper
					padding: 0 3rem

			.buttons
				padding: 2.5rem 3rem 3rem
				@include flex-row-between(2rem)

				> div

					&:first-child
						width: 14rem

					&:last-child
						width: 9rem


	@media (min-width: #{breakpoint('md')})

		.wrapper

			> div:first-child
				overflow: unset

				.left-body-wrapper
					overflow: auto

			.buttons
				border-top: unset

</style>