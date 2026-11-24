<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { fulfillmentList as fL } from 'src/lists/fulfillments'
	import { statusList as sL } from 'src/lists/statuses'
	import Button from 'src/components/elements/button.svelte'



	export let filterFulfillmentMethod:	string
	export let filterOrderStatus:		string

	let fulfillment:	string	= 'all',
		status:			string	= 'all',
		refresh:		boolean	= true

	const reset = () => {
		
		fulfillment	= 'all'
		status		= 'all'
	}

	const update = () => {

		filterFulfillmentMethod	= fulfillment
		filterOrderStatus		= status
		
		layout.closeMenu()
	}

	const handleOverlayClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement
		
		// Don't close if the click is on a select element or option
		if (target.tagName === 'SELECT' || target.tagName === 'OPTION') {
			event.preventDefault()
			event.stopPropagation()
			return
		}
		
		// Only close if clicking directly on the overlay (not propagated from select)
		if (target.classList.contains('fulfillment-overlay')) {
			layout.closeMenu()
		}
	}

	$: if ($layout.overlay == 'order-fulfillment' && refresh) {

		fulfillment	= filterFulfillmentMethod
		status		= filterOrderStatus
		refresh		= false
	
	} else if ($layout.overlay == null) {
		refresh = true
	}

</script>



{#if $layout.overlay == 'order-fulfillment'}

	<div role="menu" tabindex="0" class="wrapper">
		<div class="fulfillment">
			<span>Fulfillment Method</span>
			<select bind:value={fulfillment}>
				<option value="all">All</option>

				{#each fL as fulfillment (fulfillment)}

					{#if !fulfillment.deprecated}

						<option value={fulfillment.id}>{fulfillment.title}</option>
						
					{/if}

				{/each}

			</select>
		</div>
		<div class="status">
			<span>Order Status</span>
			<select bind:value={status}>
				<option value="all">All</option>

				{#each sL as status (status)}

					<option value={status.id}>{status.title}</option>

				{/each}

			</select>
		</div>
		<div class="buttons">
			<div>

				<Button action={reset} disabled={fulfillment == 'all' && status == 'all' ? true : false} thin>Reset All</Button>

			</div>
			<div>

				<Button action={update} thin>Update</Button>

			</div>
		</div>
	</div>

	<div role="presentation" class="fulfillment-overlay" on:click={handleOverlayClick} on:keypress={layout.closeMenu}></div>

{/if}



<style lang="sass">

	.wrapper
		position: absolute
		z-index: 100
		top: calc(100% + .75rem)
		right: 0		
		height: fit-content
		width: max-content
		padding: 1.5rem
		border: none !important
		border-radius: var(--pico-border-radius) var(--pico-border-radius)
		background-color: var(--cm-utility-background)
		box-shadow: var(--cm-box-shadow)
		color: var(--cm-text)
		cursor: default
		@include flex-col(1.5rem)

		> div

			span
				display: inline-block
				margin-bottom: .5rem

			select
				padding: .5rem

		.buttons
			@include flex-row(1.5rem)

	.fulfillment-overlay
		position: fixed
		z-index: 30		
		background-color: var(--pico-modal-overlay-background-color)
		@include inset

</style>