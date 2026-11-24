<script lang="ts">

	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { modal } from 'src/features/modules/modal/store'
	import ModalAlert from 'src/features/modules/modal/partials/alert.svelte'



	onMount(() => document.addEventListener('keyup', event => { if (event.key === 'Escape' && $modal.open) modal.close() }))

	$: _ = $modal.name

</script>



{#if browser }

	<dialog class={_} open={$modal.open} on:mousedown|self={modal.close} on:keypress|self={modal.close}>

		<ModalAlert {modal} />
		
		<article>
		
			{#if $modal.comp}
					
				<svelte:component this={$modal.comp} {modal} />

			{/if}

			<span style="display:contents"></span>
		</article>
	</dialog>

{/if}



<style lang="sass">

	$animation-duration: .2s

	:root
		--m-modal-max-height: calc(100% - 2rem)
		--m-modal-min-height: 60%

	// :global(.modal-is-switching-out dialog > article)
	// 	animation-duration: $animation-duration
	// 	animation-timing-function: ease-in-out
	// 	animation-fill-mode: both
	// 	animation-name: modal-switch-out

	// :global(.modal-is-switching-in dialog > article)
	// 	animation-duration: $animation-duration
	// 	animation-timing-function: ease-in-out
	// 	animation-fill-mode: both
	// 	animation-delay: $animation-duration
	// 	animation-name: modal-switch-in

	dialog
		padding-top: env(safe-area-inset-top)
		padding-bottom: env(safe-area-inset-bottom)

		article
			box-shadow: var(--cm-box-shadow)
			border-radius: var(--pico-border-radius)
			overflow: hidden
			max-height: var(--m-modal-max-height)
			min-height: var(--m-modal-min-height)
			min-width: 288px
			background-color: var(--cm-background)
			@include flex-col

		&.alert

			article
				min-height: fit-content


	@media (min-width: #{breakpoint('sm')})

		:root
			--m-modal-max-height: calc(100% - 4rem)

	@media (min-width: #{breakpoint('md')})

		:root
			--m-modal-max-height: calc(100% - 8rem)

	// @keyframes modal-switch-in
	// 	from
	// 		transform: translateY(100%)
	// 		opacity: 0

	// @keyframes modal-switch-out
	// 	from
	// 		transform: translateY(0%)

	// 	to
	// 		transform: translateY(100%)
	// 		opacity: 0

</style>