<script lang="ts">

	import { skus as s } from 'src/stores/skus'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import Button from 'src/components/elements/button.svelte'

	

	export let closed: any[]
	export let company: any
	export let fetch: any

</script>



{#each closed as {dateUpdatedShortHand, dateShortHand, id:orderId, orderItems, user} (orderId)}

	<tr class="order">
		<td rowspan={orderItems.length + 1}>
			<span class="date updated">{dateUpdatedShortHand}</span>
			<span class="date">{dateShortHand}</span>
		</td>
		<td colspan="5">
			<div>
				<div class="customer">

					{#if user}

						<span class="phone-number">{user.phoneNumber}</span>
						<span class="name">{user.fullName}</span>

					{:else}

						<span>Unknown Customer</span>

					{/if}

				</div>
				<span class="order-status">

					<Button modal="distributor-order-details" data={{orderId, company, fetch}} outline text pill mini>View Details</Button>					

				</span>
			</div>
		</td>
	</tr>

	{#each orderItems as {fulfillment, id:orderItemId, skuId, quantity} (orderItemId)}

		{@const sku = skuId ? s.getById(skuId) : null}
		{@const variant = sku?.variant ?? null}
		{@const product = variant?.product ?? null}

		<tr class="item">
			<td>
				<span class="quantity">{quantity}</span>
			</td>
			<td>
				<span class="multiple">x</span>
			</td>
			<td colspan="3">
				<div>
					<div class="identifier">

						{#if sku}

							<span class="sku-code">{sku.code}</span>
							<span class="divide">|</span>
							<span class="title">{product.title}</span>

						{:else}

							<span>No SKU for {orderItemId}</span>

						{/if}

					</div>
					<span class="fulfillment">{f.get('id', fulfillment)?.title}</span>
				</div>
			</td>
		</tr>

	{/each}

	<tr class="buttons">
		<td colspan="6"></td>
	</tr>

{/each}



<style lang="sass">

	div,
	span
		display: inline-block
		width: max-content

	tr

		&.order

			td
				border-color: var(--cm-text-secondary)
				color: var(--cm-text-secondary)

			td:first-child
				width: 1%
				padding-left: 0
				padding-right: .5rem
				border-color: transparent
				vertical-align: top

			td:nth-child(2)
				padding-left: 0

			td:nth-child(3)
				padding-left: 0
				padding-right: 0

			td:last-child
				padding-right: 0
					
				> div								
					width: 100%
					@include flex-row-middle-between(.5rem)

		&.order:not(:nth-child(2))

			td
				padding-top: 3rem

			&:first-child
				
				td
					padding-top: 0

		&.item

			td:first-child
				width: 1%
				padding-right: .25rem

			td:nth-child(2)
				width: 1%
				padding-right: 0
				padding-left: 0

			td:nth-child(3)
				padding-left: .25rem

			td:nth-child(4)
				padding-left: 0
				padding-right: 0

				span:first-child
					width: 84px
					text-align: right

				span:last-child
					width: 60px
					text-align: left

			td:last-child
				text-align: left

				> div								
					width: 100%
					@include flex-row-middle-between(.5rem)

		&.item:hover

			td
				background-color: var(--cm-utility-highlight)

		&.buttons

			td
				border-color: transparent
						

	.date
		width: max-content
		min-width: max-content

		&.updated
			font-size: 1.5rem
			font-weight: 600
			color: var(--cm-text-money)

	.customer
		width: 100%
		max-width: 695px
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		font-size: 1.25rem

		> span
			display: inline

		.name
			font-weight: 600
			line-height: normal

		.phone-number
			font-size: .8em

	.order-status
		width: max-content
		min-width: max-content
		font-weight: 600
		font-size: 1.25rem
		color: var(--cm-text-money)

	.quantity,
	.multiple,
	.identifier,
	.fulfillment
		color: var(--cm-text-secondary)

	.identifier
		width: 100%
		max-width: 675px
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		line-height: normal
		@include flex-row-left(.5rem)

		.sku-code
			font-weight: 600

	@media (min-width: #{breakpoint('xl')})

		.customer
			max-width: 935px

		.identifier
			max-width: 915px

	@media (min-width: #{breakpoint('xxl')})

		.customer
			max-width: 1200px

		.identifier
			max-width: 1180px

</style>