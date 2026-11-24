<script lang="ts">

	import type { Address } from 'src/types/address'

	import Button from 'src/components/elements/button.svelte'



	export let validate: boolean
	export let potentials: Address[]
	export let address: Address
	export let selection: ((type:string, potential:Address|null)=>void)
	export let label: string												= 'Save'

</script>


<div class="potentials-wrapper">

	{#if validate}

		<span>The address you entered may not be valid.</span>

		{#if potentials.length > 0}

			<div class="options">
				<span>Suggested Address{potentials.length > 1 ? 'es' : ''}:</span>

				{#each potentials as potential (potential)}

					<div>
						<div>
							<div>{potential.address1}</div>
							
							{#if potential.address2}
							
								<div>{potential.address2}</div>
								
							{/if}

							<div>{potential.city}, {potential.state} {potential.zipCode}</div>
						</div>
						<div>
						
							<Button action={() => selection('sugested', potential)} c="selection-button" thin>{label}</Button>
						
						</div>
					</div>

				{/each}

			</div>

		{/if}

		<div class="options">
			<span>Original Address:</span>
			<div>
				<div>
					<div>{address.address1}</div>
						
					{#if address.address2}
					
						<div>{address.address2}</div>
						
					{/if}

					<div>{address.city}, {address.state} {address.zipCode}</div>
				</div>
				<div>
				
					<Button formSubmit={() => selection('original', null)} c="selection-button" thin>{label}</Button>

				</div>
			</div>
		</div>
		<div>
		
			<Button action={() => selection('new', null)} c="selection-button">Enter a New Address</Button>

		</div>

	{/if}

</div>



<style lang="sass">

	.potentials-wrapper		
		width: 100%
		@include flex-col(2rem)

		> span
			font-size: 1.25rem
			font-weight: 600

		.options
			@include flex-col(.5rem)

			> span
				display: inline-block
				font-weight: 600

			> div
				@include flex-row-middle-between

</style>