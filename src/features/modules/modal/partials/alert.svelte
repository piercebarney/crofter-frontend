<script lang="ts">

	import Label from 'src/components/elements/label.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	let data: any = null

	const action = (resolution = false) => {

		modal.clearAlert()

		data.resolve(resolution)
	}

	$: alert = $modal.alert

	$: if (alert.open)	data = alert.onClose && alert.closing ? alert.onClose : alert.data
	else				data = null

</script>



{#if data}

	<div class="modal-alert-wrapper {data?.type ? data.type : 'info'}">
		<div>
		
			{#if data.title}
			
				<Label margin={false} center={true}>{data.title}</Label>

			{:else}

				<Label margin={false} center={true}>Are you sure?</Label>

			{/if}
			
			{#if data.message}
			
				<p>{data.message}</p>

			{/if}

			<div class="buttons">

				{#if data.buttons}

					{#if data.buttons.accept}

						<Button {action} c={`modal-alert-button ${data?.type ? data.type : 'info'}`} outline>{data.buttons.accept}</Button>

					{/if}

					{#if data.buttons.deny}

						<Button action={modal.closeAlert}  c={`modal-alert-button ${data?.type ? data.type : 'info'}`}>{data.buttons.deny}</Button>

					{/if}

				{:else}
				
					<Button {action} c={`modal-alert-button ${data?.type ? data.type : 'info'}`} outline>Yes, I'm sure</Button>

					<Button action={modal.closeAlert} c={`modal-alert-button ${data?.type ? data.type : 'info'}`}>Cancel</Button>

				{/if}

				<span style="display:contents"></span>
			</div>
		</div>
	</div>

{/if}



<style lang="sass">

	:root
		--c-modal-alert-border-color: var(--cm-info)

	:global(.modal-alert-button)
		min-width: max-content

	.modal-alert-wrapper		
		z-index: 30
		padding: 2rem
		background-color: var(--pico-modal-overlay-background-color)
		@include absolute

		&.danger
			--c-modal-alert-border-color: var(--cm-danger)

		&.warning
			--c-modal-alert-border-color: var(--cm-warning)

		&.success
			--c-modal-alert-border-color: var(--cm-success)

		> div
			width: 100%
			max-width: calc(100% - 2rem)
			border: .25rem solid var(--c-modal-alert-border-color)
			border-radius: var(--pico-border-radius)
			padding: 2rem
			background-color: var(--cm-primary-inverse)
			@include absolute-middle-center
			@include flex-col-middle(2rem)

			.buttons				
				width: 100%
				@include flex-col(1rem)

	@media (min-width: #{breakpoint('sm')})

		.modal-alert-wrapper

			> div
				max-width: calc(700px - 16rem)

				.buttons
					@include flex-row(2rem)

	@media (min-width: #{breakpoint('md')})

		.modal-alert-wrapper

			> div
				max-width: calc(700px - 8rem)
	
</style>