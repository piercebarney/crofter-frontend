<script lang="ts">

	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { statuses as oIS } from 'src/lists/statuses'
	import { skus as s } from 'src/stores/skus'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import A from 'src/components/elements/a.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'

	

	export let open: any[]
	export let company: any
	export let fetch: any
	export let readyAllAlert: any

</script>



{#each open.filter((order:any) => order.show) as {dateShortHand, id:orderId, orderItems, statusDetails, user, fulfillments} (orderId)}

	{@const promoCode = orderItems[0]?.promoCode || null}

	<tr class="order">
		<td>
			<div>
				<span class="date">{dateShortHand}</span>
				<div class="customer">
					<span class="phone-number">

						{#if user}

							<A href={`tel:${user.phoneNumber}`} inverse>{user.phoneNumber}</A>

						{:else}

							<span>Unknown Customer Phone Number</span>

						{/if}

					</span>

					{#if user}

						<span class="name">{user.fullName}</span>

					{:else}

						<span>Unknown Customer Name</span>
						
					{/if}

				</div>
				<span class="order-status">

					<Button modal="distributor-order-details" data={{orderId, company, fetch}} outline text pill mini>Details</Button>

				</span>
			</div>
		</td>
	</tr>

	{#each fulfillments as {id:fId, fulfillment:fulfillmentName, orderItemIds} (fId)}

		<tr class="info">
			<td>
				<div>

					{#if fulfillmentName == 'delivery'}

						{@const address = orderItems.find((item: any) => item.deliveryAddressId == fId)?.deliveryAddress}

						{#if address}

							{@const text = `${address.city.toUpperCase()} (${[address.address1 ?? false, address.address2 ?? false].filter(Boolean).join(', ')})`}
							{@const addressString = [address.address1 ?? '', address.address2 ?? '', address.city ?? '', address.state ?? '', address.zipCode ?? ''].filter(Boolean).join(' ')}
							{@const mapURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`}

							<div class="fulfillment link">

								{#if address.deliveryInstructions}

								<Button modal="distributor-order-details" data={{orderId, company, fetch}} wrapper>

									<Icon name="info" size="1.25rem" />

								</Button>

								{/if}

								<A href={mapURL} target="_blank" inverse>{text}</A>

								<span style="display:contents"></span>
							</div>

						{:else}

							<span class="fulfillment">Unknown Delivery Address</span>

						{/if}

					{:else}

						{@const location = pL.get(fId)}

						{#if location}

							<span class="fulfillment">{location.title}</span>

						{:else}

							<span class="fulfillment">Unknown Pickup Location</span>

						{/if}

					{/if}

					{#if promoCode}

						<span class="promo-code">Promo Code: {promoCode}</span>

					{/if}

				</div>
			</td>
		</tr>

		{#each orderItems.filter((item: any) => orderItemIds.includes(item.id) && item.show) as {fulfillment, id:orderItemId, quantity, skuId, status} (orderItemId)}

			{@const sku = skuId ? s.getById(skuId) : null}
			{@const variant = sku?.variant ?? null}
			{@const product = variant?.product ?? null}

			<tr class="item">
				<td>
					<div>
						<div>
							<div class="identifier">

								<span class="quantity">{quantity}</span>
								<span class="multiple">x</span>

								{#if sku}

									<span class="sku-code">{sku.code}</span>
									<span class="divide">|</span>
									<span class="title">{product.title}</span>

								{:else}

									<span>No SKU for {orderItemId}</span>

								{/if}

							</div>
						</div>
						<div>
							<div>
								<span class="fulfillment">{f.get('id', fulfillment)?.title}</span>
								<span class="divide">|</span>
								<span class="item-status">{oIS.titleById(status)}</span>
							</div>
						</div>
					</div>
				</td>
			</tr>
		
		{/each}

	{/each}

	<tr class="buttons">
		<td>
			<div class="order-buttons">

				{#if (statusDetails.newCount && statusDetails.newCount > 0) || (statusDetails.orderedCount && statusDetails.orderedCount > 0)}

					<Button action={() => company.orderReady(orderId)} alert={readyAllAlert} pill mini>Mark Order as Ready</Button>

				{:else if (statusDetails.readyCount && statusDetails.readyCount > 0)}

					<Button action={() => company.orderFulfill(orderId)} outline pill mini>Mark Order as Fulfilled</Button>

				{:else}

					<span>Order Closed</span>

				{/if}

			</div>
		</td>
	</tr>

{/each}



<style lang="sass">

	div:not(.customer),
	span:not(.name):not(.title)
		width: max-content

	tr

		&.order

			td
				border-color: var(--cm-text-secondary)
				padding: .5rem 0

				> div
					width: 100%
					@include flex-row-middle(.5rem)

					span:first-child
						flex-grow: 0
						flex-shrink: 0

					.customer
						flex-grow: 1
						flex-shrink: 1
						min-width: 0

					span:last-child
						flex-grow: 0
						flex-shrink: 0

		&.order:not(:nth-child(2))

			td
				padding-top: 4rem

			&:first-child
				
				td
					padding-top: 0

		&.info

			td
				
				> div
					@include flex-col-left(.5rem)

		&.item

			td
				padding: .5rem

				> div
					width: 100%
					@include flex-col(.5rem)

					> div:nth-child(2)									
						width: 100%
						@include flex-row-middle-left(.25rem)

					> div:last-child									
						width: 100%
						@include flex-row-middle-between

						> div:last-child
							@include flex-row-middle-right(.5rem)

		&.item:hover
		
			td
				background-color: var(--cm-utility-highlight)

		&.buttons

			td
				padding-left: .5rem
				border-color: transparent

	.date
		width: max-content
		min-width: max-content
		font-size: 1.5rem
		font-weight: 600

	.customer
		width: 100%
		font-size: 1.25rem

		> span
			display: block

		.name
			font-weight: 600
			white-space: nowrap
			overflow: hidden
			text-overflow: ellipsis
			line-height: normal

		.phone-number
			font-size: .8em

	.order-status
		width: max-content
		min-width: max-content
		font-weight: 600

	.order-buttons
		float: right
		display: inline-block

		> span
			padding-right: .5rem
			color: var(--cm-text-money)

	.fulfillment
		display: inline-block

		&.link	
			color: var(--cm-primary)
			stroke: var(--cm-primary)

	div.fulfillment
		@include flex-row-middle-between(.5rem)

	.identifier
		max-width: 75vw
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		line-height: normal
		@include flex-row-left(.5rem)

		.sku-code
			font-weight: 600

	@media (min-width: #{breakpoint('sm')})

		.identifier
			max-width: 455px

</style>