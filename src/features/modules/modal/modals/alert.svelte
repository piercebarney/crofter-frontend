<script lang="ts">

	import Label from 'src/components/elements/label.svelte'
	import Button from 'src/components/elements/button.svelte'

	export let modal: any

	const alert = $modal.data?.alert ? $modal.data.alert : null

	const action = () => {

		modal.onClose(() => alert.resolve(true))

		modal.close()

		// setTimeout(() => alert.resolve(true), 500);
	}

</script>



{#if alert}

	<div class={`alert-wrapper ${alert?.type ? alert.type : 'info'}`}>

		{#if alert.title}

			<Label margin={false} center={true}>{alert.title}</Label>

		{:else}

			<Label margin={false} center={true}>Are you sure?</Label>

		{/if}

		{#if alert.message}

			<p>{alert.message}</p>
			
		{/if}

		<div class="buttons">

			{#if alert.buttons}

				{#if alert.buttons.accept}

					<Button {action} outline c={alert?.type ? alert.type : 'info'}>{alert.buttons.accept}</Button>

				{/if}

				{#if alert.buttons.deny}

					<Button action={modal.close} c={alert?.type ? alert.type : 'info'}>{alert.buttons.deny}</Button>

				{/if}

			{:else}
			
				<div>
					
					<Button {action} outline c={alert?.type ? alert.type : 'info'}>Yes, I'm sure</Button>

				</div>
				<div>
				
					<Button action={modal.close} c={alert?.type ? alert.type : 'info'}>Cancel</Button>
				
				</div>

			{/if}

		</div>
	</div>

{/if}



<style lang="sass">

	:root
		--c-alert-border-color: var(--cm-info)

	.alert-wrapper		
		// margin: -.5rem
		padding: 1rem
		border: .25rem solid var(--c-alert-border-color)
		border-radius: var(--pico-border-radius)
		background-color: var(--cm-primary-inverse)
		@include flex-col-middle-center(2rem)

		&.danger
			--c-alert-border-color: var(--cm-danger)

		&.warning
			--c-alert-border-color: var(--cm-warning)

		.buttons			
			width: 100%
			@include flex-col-center(1rem)

			div
				flex-grow: 0
				width: max-content

	@media (min-width: #{breakpoint('sm')})

		.alert-wrapper
			padding: 2rem

			.buttons
				@include flex-row(2rem)

	@media (min-width: #{breakpoint('md')})

		.alert-wrapper
			padding: 2rem 4rem

		// > div
		// 	@include flex-col-left(1rem)
		// 	margin: 0 0 -2rem
		// 	padding: var(--modal-spacing) var(--modal-spacing) calc(var(--modal-spacing) + 2rem)

		// 	&.danger
		// 		background-color: var(--cm-danger)

		// 		:global(.contrast):not(.outline)
		// 			color: var(--cm-danger)

		// 	&.warning
		// 		background-color: var(--cm-warning)
				
		// 		h2,
		// 		p
		// 			color: #000

		// 		:global(.contrast)
		// 			color: #000

		// 	&.success
		// 		background-color: var(--cm-success)

		// 		:global(.contrast):not(.outline)
		// 			color: var(--cm-success)

		// 	&.info
		// 		background-color: var(--cm-info)

		// 		:global(.contrast):not(.outline)
		// 			color: var(--cm-info)

		// 	h2,
		// 	p
		// 		color: #fff
		// 		margin: 0 0 0

		// 	h2
		// 		text-align: center

		// 	.row
		// 		display: flex
		// 		gap: var(--modal-gap)

		// 		:global(button)
		// 			--cm-border-color: #fff
		// 			--cm-box-shadow: unset

		// 		:global(button):not(.outline)
		// 			--cm-background-color: #fff

		// 		:global(button.outline)
		// 			--color: #fff

</style>