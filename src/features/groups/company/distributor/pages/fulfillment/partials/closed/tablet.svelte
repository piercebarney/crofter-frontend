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
		<td colspan="5">
			<div>
				<div>
					<div class="date">
						<span class="updated">{dateUpdatedShortHand}</span>
						<span>{dateShortHand}</span>
					</div>
					<div class="customer">

						{#if user}

							<span class="phone-number">{user.phoneNumber}</span>
							<span class="name">{user.fullName}</span>
							
						{:else}

							<span>Unknown Customer</span>

						{/if}

					</div>
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
		<td colspan="5"></td>
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
				padding-left: 0
				padding-right: 0
				border-color: var(--cm-text-secondary)
				color: var(--cm-text-secondary)

				> div								
					width: 100%
					@include flex-row-middle-between(.5rem)

					> div
						@include flex-row-middle-between(.5rem)

					span
						flex-grow: 0

		&.order:not(:nth-child(2))

			td
				padding-top: 2.5rem

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
				padding-right: .5rem

				> div
					width: 100%
					@include flex-row-middle-between(.5rem)

			td:nth-child(4)
				padding-left: 0
				padding-right: 0
				text-align: center

				span:first-child
					width: 66px
					text-align: right

				span:last-child
					width: 46px
					text-align: left

			td:nth-child(5)
				padding-left: .5rem
				text-align: left

				> div								
					width: 100%
					@include flex-row-middle-between(.5rem)

					span:last-child
						flex-grow: 0

		&.item:hover

			td
				background-color: var(--cm-utility-highlight)

		&.buttons

			td
				border-color: transparent				

	.date
		width: 70px
		min-width: 70px

		.updated
			font-size: 1.5rem
			font-weight: 600
			color: var(--cm-text-money)

	.customer
		width: 100%
		max-width: 490px
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
			display: block
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
		max-width: 560px
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis
		line-height: normal
		@include flex-row-left(.5rem)

		.sku-code
			font-weight: 600

</style>