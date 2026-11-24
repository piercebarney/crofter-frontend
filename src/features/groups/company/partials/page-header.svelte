<script lang="ts">

	import { layout } from 'src/stores/layout'
    import { scrollBorderBottom } from 'src/lib/helpers'



	let wrapperElement: HTMLDivElement

	$: scrollBorderBottom($layout.scroll.position, wrapperElement)

</script>



<div class="options-wrapper" bind:this={wrapperElement}>
	<div class="container">

		{#if $$slots.left}

			<div class="left side">

				<slot name="left" />

				<span style="display:contents"></span>
			</div>

		{/if}

		{#if $$slots.right}

			<div class="right side">

				<slot name="right" />

				<span style="display:contents"></span>
			</div>

		{/if}

	</div>
</div>



<style lang="sass">

	.options-wrapper
		z-index: 100
		position: sticky
		top: 0
		right: 0
		left: 0
		background-color: var(--cm-background)
		transition: top 0.3s ease

		> div
			padding-top: .75rem
			padding-bottom: .75rem
			@include flex-row-between(1rem)

			.side
				flex-grow: 1
				stroke: var(--cm-text)
				line-height: 1.2
				@include flex-row-middle(3rem)

				&.left
					justify-content: start

				&.right
					justify-content: end
				

	@media (min-width: #{breakpoint('sm')})

		.options-wrapper

			> div
				@include flex-row-between(3rem)

</style>