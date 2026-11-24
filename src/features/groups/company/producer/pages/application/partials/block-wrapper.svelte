<script lang="ts">

	import Icon from 'src/components/elements/icon/element.svelte'



	export let company:		any			= null
	export let values:		any			= {}
	export let required:	string[]	= []
	export let status:		boolean		= true
	export let inReview:	boolean		= false

	let complete: boolean	= false

	$: if (required.length > 0 && $company && $company.merchantApplicationDetails) {
		
		let incomplete = false

		for (const key of required) {

			if (key.startsWith('business_')) {

				if ($company.merchantApplicationDetails.application.business) {

					if (!$company.merchantApplicationDetails.application.business[key.replace('business_', '')]) incomplete = true

				} else incomplete = true

			} else if (key.startsWith('estimates_')) {

				if ($company.merchantApplicationDetails.application.estimates) {

					if (!$company.merchantApplicationDetails.application.estimates[key.replace('estimates_', '')]) incomplete = true

				} else incomplete = true

			} else if (key.startsWith('officer_')) {

				if ($company.merchantApplicationDetails.application.officer) {

					if (key.includes('address_')) {

						if (!$company.merchantApplicationDetails.application.officer.address[key.replace('officer_address_', '')]) incomplete = true

					} else {

						if (!$company.merchantApplicationDetails.application.officer[key.replace('officer_', '')]) incomplete = true
					}

				} else incomplete = true

			} else {
				
				if (key.startsWith('address_')) {
					
					if ($company.addresses.length == 0 || !$company.addresses[0][key.replace('address_', '')]) incomplete = true
				
				} else {
					
					if (!$company[key]) incomplete = true
				}
			}
		}

		complete = !incomplete
	}

	$: if (Object.keys(values).length > 0) {

		let incomplete = false

		for (const key of required) {

			if (!values[key]) incomplete = true
		}

		complete = !incomplete
	}

</script>


<div class="wrapper">
	<div class="top">
		<span class="label">

			<slot name="label" />

		</span>

		{#if status}

			<div class="status-wrapper">

				{#if complete || inReview}
				
					<div class="complete">
						<div>

							<Icon name="check" size="1.25rem" />

						</div>
					</div>

					{#if inReview}

						<span>Under Review</span>

					{:else}

						<span>Complete</span>

					{/if}

				{:else}

					<div></div>
					<span>Incomplete</span>

				{/if}

			</div>

		{/if}

	</div>
	
	<slot />

	<div class="submit-button">
		<div>
		
			<slot name="submit-button" />

		</div>
	</div>
</div>



<style lang="sass">

	.wrapper
		box-shadow: 0px 4px 24px 0px #00000008
		width: 100%
		padding: 1.5rem 1rem
		border: 1px solid var(--cm-border)
		border-radius: var(--pico-border-radius)
		@include flex-col(1.5rem)

		.top
			@include flex-col(1.5rem)

			.label
				font-size: 1.5rem
				font-weight: 600

			.status-wrapper
				min-width: max-content
				padding: 1rem
				border: 1px solid var(--cm-border)
				border-radius: var(--pico-border-radius)
				@include flex-row-middle(1rem)

				> div
					position: relative
					background-color: #F9F9F9
					border: 1px solid var(--cm-border)
					border-radius: 50%
					@include max-area(1.5rem)
					@include area(1.5rem)

					&.complete
						background-color: #468047

					> div
						stroke: #FFFFFF
						stroke-width: 3
						@include absolute-middle-center

		.submit-button
			width: 100%

			> div
				float: right
				width: 8rem


	@media (min-width: #{breakpoint('sm')})

		.wrapper
			padding: 2rem

			.top
				@include flex-row-middle-between(1.5rem)


</style>