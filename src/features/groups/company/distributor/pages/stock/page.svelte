<script lang="ts">

	import { browser } from '$app/environment'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import { layout } from 'src/stores/layout'
	import PageHeader from 'src/features/groups/company/partials/page-header.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	// export let application: boolean = false
	
	const defaultAdjust: number = 1
	
	let company: any						= null,
		stock: any							= null,
		init: boolean						= true,
		set: Record<string, number>			= {},
		adjusts: Record<string, number>		= {},
		flashes: Record<string, boolean>	= {}

	const triggerFlash = (id:string) => {

		flashes[id]	= true
		flashes		= { ...flashes }

		setTimeout(() => {

			flashes[id]	= false
			flashes		= { ...flashes }

		}, 800)
	}

	const setCount = async (id:string, e:KeyboardEvent|null = null) => {

		if (e && (e.key !== 'Enter' || set[id] === undefined || set[id] === null || set[id] < 0)) return

		const ok = await company.setStockItemCount(id, set[id])

		if (ok) {
			
			triggerFlash(id)

			delete set[id]

			set = set
		}

		return ok
	}

	const adjustCount = async (id:string, count:number, multiplier:number = 1) => {

		let adjustValue = (adjusts[id] ?? defaultAdjust) * multiplier

		if (count + adjustValue < 0) adjustValue = (count * -1)
		
		const ok = await company.adjustStockItemCount(id, adjustValue)

		if (ok) {
			
			triggerFlash(id)

			delete adjusts[id]

			adjusts = adjusts
		}

		return ok
	}

	$: if (browser && company == null && $c) company = c.get($account.active.id)

	$: init && company && (() => {

		init = false

		if (!$company.skus) company.stockFetch()

	})()

	$: stockItems		= $company?.stockItems ?? []
	$: skus				= $company?.skus ?? []
	$: storageLocations	= $company?.storageLocations ?? []

	$: $company && stockItems && skus && storageLocations && (() => {

		const s:any = {}

		if (storageLocations.length > 0) {

			for (const location of storageLocations) {

				const locationName	= location.name
				const stockItems	= company.getStockItemsByStorageLocationId(location.id)

				if (stockItems?.length > 0) {
					
					if (!Object.hasOwn(s, locationName)) s[locationName] = []

					for (const stockItem of stockItems) {

						const sku = company.getSkuById(stockItem.skuId)

						if (sku) s[locationName].push({...stockItem, sku})
					}
				}
			}
		}

		stock = s

	})()

	$: isMobile	= $layout.isMobile

</script>
  


{#if stock}

	{#if isMobile}

		<PageHeader>

			<div slot="left">
				<div class="button-group">
					<div>

						<Button modal="storage-locations" data={{company}} mini>Storage Locations</Button>

					</div>
					<div>

						<Button modal="skus" data={{company}} mini>SKUs</Button>

					</div>
					<div>

						<Button modal="stock-items" data={{company}} mini>Stock Items</Button>

					</div>
				</div>
			</div>

		</PageHeader>

		<div class="skus-wrapper-mobile container list">

			{#if Object.keys(stock).length > 0}

				{#each Object.keys(stock) as locationName (locationName)}

					{@const stockItems = stock[locationName]}

					{#if stockItems.length > 0}
					
						<div class="location-section">
							<span class="location-header">{locationName}</span>
							
							{#each stockItems as {id:stockItemId, sku, maxCapacity, count} (stockItemId)}
								
								<div class="cm-list-item">
									<div class="sku-wrapper">
										<div>
											<span class="code">{sku.code}</span>
										
											{#if !sku.active}
										
												<span class="inactive">inactive</span>
										
											{/if}

										</div>
										<div class="details">
											<span><b>Fulfillment:</b> {[sku.canPickUp && 'PickUp', sku.canDeliver && 'Deliver'].filter(Boolean).join(', ')}</span>
											<span><b>Max Capacity:</b> {maxCapacity || '-'}</span>
											<span class="count" class:flash={flashes[stockItemId]}><b>Count:</b> {count}</span>
										</div>
										<div class="set-adjust">
											<div class="count-wrapper">
												<input type="number" min="0" bind:value={set[stockItemId]} on:keydown={(e) => setCount(stockItemId, e)} />

												<Button action={() => setCount(stockItemId)} disabled={set[stockItemId] === undefined || set[stockItemId] === null || set[stockItemId] < 0} square>=</Button>

											</div>
											<div class="count-wrapper">
												<input type="number" min="0" placeholder="1" class="thin" bind:value={adjusts[stockItemId]} />

												<Button action={() => adjustCount(stockItemId, count, -1)} square thin>-</Button>

												<Button action={() => adjustCount(stockItemId, count)} square thin>+</Button>

											</div>
										</div>
									</div>
								</div>

							{/each}

						</div>

					{/if}

				{/each}

			{:else}

				<div class="empty">
					<sapn>There are no SKUs for this company.</sapn>
				</div>

			{/if}

		</div>
		<div class="add-button-mobile">

			<Button action={company.stockFetch} square>

				<Icon name="refresh" size="2rem" />

			</Button>

		</div>
		
	{:else}

		<PageHeader>

			<div slot="left">
				<div class="button-group">
					<div>

						<Button modal="storage-locations" data={{company}} thin>Storage Locations</Button>

					</div>
					<div>

						<Button modal="skus" data={{company}} thin>SKUs</Button>

					</div>
					<div>

						<Button modal="stock-items" data={{company}} thin>Stock Items</Button>

					</div>
				</div>
			</div>
			<div slot="right">

				<Button action={company.stockFetch} thin>Refresh</Button>

			</div>

		</PageHeader>

		<div class="skus-wrapper container">

			{#if Object.keys(stock).length > 0}
				
				{#each Object.keys(stock) as locationName (locationName)}

					{@const stockItems = stock[locationName]}

					{#if stockItems.length > 0}
					
						<div class="location-section">
							<span class="location-title">{locationName}</span>
							<table>
								<thead>
									<tr>
										<th>Code</th>
										<th>Fulfillment</th>
										<th>Max Capacity</th>
										<th>Count</th>
										<th>Set count to</th>
										<th>Adjust count by</th>
									</tr>
								</thead>
								<tbody>
									<tr style="display:contents">	
										<td style="display:contents"></td>
									</tr>

									{#each stockItems as {id:stockItemId, sku, maxCapacity, count} (stockItemId)}

										<tr>
											<td>
												<span class="code">{sku.code}</span>

												{#if !sku.active}

													<span class="inactive">inactive</span>

												{/if}

											</td>
											<td>
												<span>{[sku.canPickUp && 'PickUp', sku.canDeliver && 'Deliver'].filter(Boolean).join(', ')}</span>
											</td>
											<td>
												<span>{maxCapacity || '-'}</span>
											</td>
											<td>
												<span class="count" class:flash={flashes[stockItemId]}>{count}</span>
											</td>
											<td width="1%">
												<div class="count-wrapper">
													<input type="number" min="0" bind:value={set[stockItemId]} on:keydown={(e) => setCount(stockItemId, e)} />

													<Button action={() => setCount(stockItemId)} disabled={set[stockItemId] === undefined || set[stockItemId] === null || set[stockItemId] < 0} square>=</Button>

												</div>
											</td>
											<td width="1%">
												<div class="count-wrapper">
													<input type="number" min="0" placeholder="1" bind:value={adjusts[stockItemId]} />

													<Button action={() => adjustCount(stockItemId, count, -1)} square>-</Button>

													<Button action={() => adjustCount(stockItemId, count)} square>+</Button>

												</div>
											</td>
										</tr>

									{/each}

								</tbody>
							</table>
						</div>

					{/if}

				{/each}

			{:else}

				<div class="empty">
					<span>There are no SKUs for this company.</span>
				</div>

			{/if}

		</div>

	{/if}

{:else}

		<div class="empty">Loading...</div>

{/if}



<style lang="sass">

	.button-group
		flex-wrap: wrap
		@include flex-row-middle-left(.5rem)

		> div
			width: fit-content

	.skus-wrapper-mobile
		min-height: 100%
		padding-top: 2rem

	.empty
		margin-top: 3rem
		font-size: 1.5rem
		text-align: center

	.location-section
		margin-bottom: 2.5rem

		&:last-child
			margin-bottom: 0

		.location-header
			display: inline-block
			margin-bottom: 1rem
			width: 100%
			border-bottom: 2px solid var(--cm-primary)
			padding: .75rem .5rem
			font-size: 1.25rem
			font-weight: 600
			color: var(--cm-primary)

		.location-title
			display: inline-block
			margin-bottom: 1.5rem
			width: 100%
			border-bottom: 2px solid var(--cm-primary)
			padding-bottom: .5rem
			font-size: 1.5rem
			font-weight: 600
			color: var(--cm-primary)

		table
			margin-bottom: 2rem

	.sku-wrapper
		padding: .5rem
		@include flex-col(.5rem)

		.code
			font-size: 1.25rem

		.inactive
			display: inline-block !important
			margin-top: 0 !important

		.details
			@include flex-row-middle-between(.5rem)
					
		.set-adjust
			flex-wrap: wrap
			@include flex-row(1rem)

	.code
		display: inline-block
		min-width: max-content
		font-weight: 600

	.inactive
		display: block
		margin-top: .25rem
		font-size: .8rem
		color: var(--cm-text-secondary)
		font-style: italic

	.count
		display: inline-block
		min-width: 2ch
		padding: .25rem
		border-radius: .25rem

	.add-button-mobile
		@include fixed-bottom-left(1rem)

	.skus-wrapper
		padding-top: 2.5rem
		padding-bottom: 2.5rem

		table

			tbody

				tr:last-child

					td
						border-color: transparent

	.count-wrapper
		@include flex-row-middle-center(.5rem)

		input
			width: 4rem
			padding-left: .5rem
			padding-right: .5rem
			text-align: center

			// Remove spinner arrows from number input
			&::-webkit-outer-spin-button,
			&::-webkit-inner-spin-button
				-webkit-appearance: none
				margin: 0

			&[type=number]
				-moz-appearance: textfield


	/* Flash animation for updated counts */

	.count.flash
		animation: count-flash .8s ease

	@keyframes count-flash
		0%
			background-color: rgba(255, 235, 59, 0.95)
		50%
			background-color: rgba(255, 235, 59, 0.35)
		100%
			background-color: transparent

</style>