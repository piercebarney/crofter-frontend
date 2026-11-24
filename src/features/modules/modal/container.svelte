<script lang="ts">

	import { getScroll, scrollBorderBottom } from 'src/lib/helpers'
	import { layout } from 'src/stores/layout'
	import Label from 'src/components/elements/label.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	// options
	export let closeButton: boolean = true
	
	// function
	export let modal: any

	// data
	export let label: string|null				= null
	export let closeButtonText: string|null		= null
	export let onDelete: (() => void)|null		= null
	export let deleteButtonText: string|null	= 'Delete'

	let headerElement: HTMLDivElement,
		scroll: number					= 0

	$: isMobile = $layout.isMobile

	$: scrollBorderBottom(scroll, headerElement)

	$: hasCaller = $modal.callerStack.length > 0

</script>



<div class="modal-wrapper" on:scroll={(e) => scroll = getScroll(e)}>
	<div class="header" bind:this={headerElement}>
		<div class="left-block">

			{#if hasCaller}

				<Button action={modal.close} role="link">
		
					<Icon name="chevronLeft" size="1.5rem"/>

				</Button>

			{/if}

			{#if onDelete}

				<Button action={onDelete} danger role="link">

					{#if isMobile}

						<Icon name="trash" size="1.5rem"/>

					{:else}

						{deleteButtonText}

					{/if}

				</Button>

			{/if}

		</div>
		<div class="center-block">

			{#if label}
			
				<Label margin={false} center>{label}</Label>

			{/if}

		</div>
		<div class="right-block">
			
			<Button action={() => modal.close(true)} role="link">
	
				<Icon name="x" />
		
			</Button>

		</div>
	</div>
	<div>
		<div class="body">
			
			<slot />
				
		</div>

		{#if closeButton}
				
			<div class="footer">

				<Button action={modal.close} role="link">{closeButtonText || (hasCaller ? 'Back' : 'Close')}</Button>

			</div>

		{/if}

	</div>
</div>



<style lang="sass">

	.modal-wrapper
		flex-grow: 1
		overflow: auto
		@include flex-col

		> div:last-child
			@include flex-col-between

		.header
			z-index: 10
			flex-grow: 0
			position: sticky
			top: 0
			max-width: 100%
			width: 100%
			padding: 1rem
			stroke: var(--cm-text)
			background-color: var(--cm-background)
			@include flex-row-top(1rem)

			.left-block
				flex: 0 0 15%
				@include flex-row-middle-left(1rem)

			.center-block
				flex: 0 1 70%
				overflow: hidden
				max-width: 100%
				min-width: 0
				text-align: center
				overflow-wrap: break-word
				word-break: break-word

			.right-block
				flex: 0 0 15%
				@include flex-row-middle-right(1rem)

		.body			
			padding: 0 1rem 1rem
			@include flex-col-top(1rem)			

		.footer
			width: 100%
			border-top: 1px solid var(--cm-border)
			padding: 1rem
			text-align: center

	
	@media (min-width: #{breakpoint('md')})

		.modal-wrapper

			.header
				padding: 1.5rem

			.body
				padding: 0 1.5rem 1.5rem
				gap: 1.5rem

			.footer
				padding: 1.5rem
				

</style>