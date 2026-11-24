<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { onMount } from 'svelte'
	import Left from 'src/features/groups/auth/pages/register/partials/left.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



    export let index:		number
	export let closeButton:	boolean			= false
	export let formSubmit:	(()=>boolean)
    export let disabled:	boolean
    export let formChange:	boolean
	export let loading:		boolean

	let display: boolean = false

	$: isMobile = $layout.isMobile

	onMount(() => display = true)

</script>



{#if display}

	{#if isMobile}

		<div class="wrapper-mobile">

			<Left bind:index={index} {formSubmit} {disabled} {loading} {formChange}>

				<slot name="left" />

			</Left>

			{#if closeButton}

				<div class="close-button-wrapper">
					
					<Button action={layout.closeMenu} wrapper><Icon name="x" /></Button>
					
				</div>

			{/if}

		</div>

	{:else}

		<div class="wrapper">
			<div>
				<div class="left">
				
					<Left bind:index={index} bind:formSubmit={formSubmit} {disabled} {loading} {formChange}>

						<slot name="left" />

					</Left>
					
				</div>
				<div class="right">

					<slot name="right" />

				</div>
			</div>

			{#if closeButton}

				<div class="close-button-wrapper">
					
					<Button action={layout.closeMenu} wrapper><Icon name="x" /></Button>
					
				</div>

			{/if}

		</div>

	{/if}

{/if}



<style lang="sass">

	.wrapper-mobile
		position: relative
		background-color: #FFFFFF
		@include fill

	.wrapper
		position: relative
		overflow: hidden
		@include fill

		> div:first-child
			position: relative
			@include fill
			@include flex-row

			> div
				flex: 0 0 50%
				height: 100%
				max-width: 50%

			.left
				background-color: var(--cm-primary-inverse)

			.right
				position: relative
				padding: 5.5rem 2.5rem
				background-color: #FBF9F7

	.close-button-wrapper
		z-index: 100
		stroke: var(--cm-text)
		@include absolute-top-right(1.5rem)





	@media (min-width: #{breakpoint('lg')})

		.wrapper
			z-index: 900
			box-shadow: var(--cm-box-shadow)
			max-width: 90vw
			width: 1200px
			max-height: 80vh
			height: 900px
			min-height: 830px
			border-radius: var(--pico-border-radius)
			@include absolute-middle-center

			> div:not(:last-child)

				.right
					padding: 3rem

		@media (max-height: 830px)

			.wrapper
				@include absolute-center


	@media (min-width: #{breakpoint('xl')})
		
		.wrapper
			max-width: 90vw
			width: 1600px
			max-height: 80vh
			height: 1200px
			min-height: 900px

		@media (max-height: 900px)

			.wrapper
				@include absolute-center

</style>