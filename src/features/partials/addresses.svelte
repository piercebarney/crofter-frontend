<script lang="ts">

	import type { Address } from 'src/types/address'

	import { user } from 'src/stores/user'
	import { company } from 'src/stores/company/store'
	import { modal as m } from 'src/features/modules/modal/store'
	import { api } from 'src/lib/api'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any							= null
	export let select: boolean						= false
	export let single: boolean 						= false
	export let singular: boolean					= false
	export let selection: string|null				= null
	export let companyId: string|null				= null
	export let valid: boolean						= false
	export let showDeliveryInstructions: boolean	= false

	$: select		= modal && $modal.data?.select ? $modal.data.select : select
	$: selection	= modal && $modal.data?.selection ? $modal.data.selection : selection
	$: companyId	= modal && $modal.data?.companyId ? $modal.data?.companyId : companyId
	$: singular		= modal && $modal.data?.singular ? $modal.data.singular : singular

	$: if (!modal) modal = m

	let store: any				= user,
		allAddresses: Address[]	= [],
		addresses: Address[]	= []

	$: if (companyId) store = company.get(companyId)

	$: if ($store) allAddresses = $store.addresses

	$: if (single && allAddresses.length > 0 && selection) {
		
		addresses = allAddresses.filter((a:Address) => {

			if (a.id == selection) {

				if	(a.address1 && a.city && a.state && a.zipCode)	valid = true
				else												valid = false

				return true
			}

			return false
		
		})

	} else if (single && allAddresses.length > 0) {
			
		let address = allAddresses.find((a:Address) => a.isDefault == true)

		if (!address) address = allAddresses[0]

		if	(address.address1 && address.city && address.state && address.zipCode)	valid = true
		else																		valid = false

		selection = address.id as string

		addresses = [address]
	
	} else addresses = allAddresses

	const makeDefault = async (addressId:string) => {

		const { address } = await api.addressUpdate({ variables:{addressId, force:true, isDefault:true} })

		store.addressUpdateDefault(address)
	}

	const makeSelection = (addressId:string) => {

		selection = addressId

		const address = allAddresses.find((a:Address) => a.id == addressId)

		if	(address && address.address1 && address.city && address.state && address.zipCode)	valid = true
		else																					valid = false

		modal.set({data:{select, selection, valid}})

		modal.close()
	}

</script>



<div class="list">

	{#each addresses as {id, address1, address2, city, state, zipCode, isDefault, deliveryInstructions} (id)}

		<div class="cm-list-item address">
			<div>
				<div>
					<div>
						
						{#if address1}

							{address1}

						{:else}
							
							<span class="missing">Address</span>
							
						{/if}
					
					</div>

					{#if address2}
					
						<div>{address2}</div>
						
					{/if}

					<div>
						
						{#if city}
						
							{city},
							
						{:else}
						
							<span class="missing">City,</span>
							
						{/if}
						
						{#if state}
						
							{state}
							
						{:else}
						
							<span class="missing">State</span>
							
						{/if} 
						
						{#if zipCode}
						
							{zipCode}
						
						{:else}
					
							<span class="missing">Zip Code</span>
						
						{/if}
					
					</div>
				</div>
				<div>

					{#if single && addresses.length > 1}
					
						<Button action={() => modal.open('addresses', {select:true, selection, ...$modal.data})} c="inverse" role="link">Switch</Button>

					{:else if select && !single}

						{#if (!selection && isDefault) || (selection == id)}

							<span>Selected</span>

						{:else}

							<Button action={() => makeSelection(id as string)} c="inverse" role="link">Select</Button>

						{/if}

					{:else if !singular && !single}

						{#if isDefault}

							<span>Default</span>

						{:else}

							<Button action={() => makeDefault(id as string)} c="inverse" role="link">Make Default</Button>

						{/if}

					{/if}

					<Button action={() => modal.open('address-update', {addressId:id, select, singular, ...$modal.data})} c="inverse" role="link">Edit</Button>

				</div>
			</div>

			{#if showDeliveryInstructions}

				{#if deliveryInstructions}

					<div class="delivery-instructions"><span>Delivery Instructions:</span> {deliveryInstructions}</div>

				{:else}

					<div class="add-delivery-instructions"><Button action={() => modal.open('address-update', {addressId:id, select, singular, ...$modal.data})} mini>Add Delivery Instructions</Button></div>

				{/if}

			{/if}

		</div>

	{/each}

	{#if !singular}

		<div class="cm-list-item add-address-button">

			{#if single}

				{#if addresses.length == 0}

					<Button action={() => modal.open('address-add', {single, select, ...$modal.data})} thin>Add Address</Button>

				{:else}

					<Button action={() => modal.open('addresses', {select:true, selection, ...$modal.data})} c="inverse" role="link">Select a Different Address</Button>

				{/if}

			{:else}

				{#if addresses.length == 0}
					
					<div>

						<Button action={() => modal.open('address-add', {single, select, ...$modal.data})} thin>Add Address</Button>
					
					</div>

				{:else}

					<Button action={() => modal.open('address-add', {single, select, ...$modal.data})} c="inverse" role="link">Add Address</Button>

				{/if}

			{/if}

		</div>

	{/if}

</div>



<style lang="sass">

	.address		
		align-items: center
		gap: var(--main-gap)
		@include flex-col-left(.5rem)

		> div:first-child
			width: 100%
			@include flex-row

			> div
				
				> *:not(:last-child)
					margin: 0 0 .25rem

			> div:nth-child(1)
				flex-grow: 1

				.missing
					color: var(--cm-text-secondary)

			> div:nth-child(2)
				
				:global(*)
					float: right
					clear: right
					text-align: right

	.add-address-button

		> div
			margin: 3rem auto 0
			width: fit-content

	.delivery-instructions
		width: 100%
		background-color: var(--cm-background-secondary)
		border-radius: var(--pico-border-radius)
		padding: .75rem 1rem
		line-height: 1.2

		span
			font-weight: 600

	.add-delivery-instructions
		margin-top: .5rem

</style>