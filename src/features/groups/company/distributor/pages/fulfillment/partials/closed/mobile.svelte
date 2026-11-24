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
		<td>
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

						<span class="phone-number">Unknown Customer</span>

					{/if}

				</div>
				<span class="order-status">

					<Button modal="distributor-order-details" data={{orderId, company, fetch}} outline text pill mini>Details</Button>

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
					<span class="fulfillment">{f.get('id', fulfillment)?.title}</span>
				</div>
			</td>
		</tr>

	{/each}

	<tr class="buttons">
		<td></td>
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
				color: var(--cm-text-secondary)

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

		&.item

			td
				padding: .5rem

				> div
					width: 100%
					@include flex-row-middle-between(.5rem)

					> div:nth-child(2)									
						width: 100%
						@include flex-row-middle-left(.25rem)

					> div:last-child									
						width: 100%
						@include flex-row-middle-between

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

		> span
			display: block

		.updated
			font-size: 1.5rem
			font-weight: 600
			color: var(--cm-text-money)

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
		font-size: 1.25rem
		color: var(--cm-text-money)

	.identifier,
	.fulfillment
		color: var(--cm-text-secondary)

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
			max-width: 365px

</style>