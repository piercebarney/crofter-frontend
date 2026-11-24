<script lang="ts">

	import type { FulfillmentName } from 'src/features/groups/consumer/pages/home/types.d.ts'

	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { layout as  l } from 'src/stores/layout'
	import A from 'src/components/elements/a.svelte'



	// options
	export let checkout: boolean					= false
	export let totalsLoading: boolean				= false
	export let locationKnown: boolean				= false
	export let totalsError: boolean					= false
	export let fulfillmentName: FulfillmentName|''	= 'delivery'
	export let promoStatuses: any					= null

	$: count							= $c.count
	$: subTotal 						= $c.subTotal?.string || null
	$: subTotalNumber					= $c.subTotal?.number || null
	$: subTotalWithDelivery				= $c.subTotalWithDelivery?.string || null
	$: discountSubTotal					= $c.discountSubTotal?.string || null
	$: discountSubTotalWithDelivery		= $c.discountSubTotalWithDelivery?.string || null
	$: deliveryChargeThresholdNumber	= $c.deliveryChargeThreshold?.number || null
	$: deliveryFee						= $c.deliveryBaseFee?.string || null
	$: deliveryTotal					= $c.deliveryTotal?.string || null
	$: tax 								= $c.tax?.string || null
	$: total							= $c.total?.string || null
	$: totalWithDelivery				= $c.totalWithDelivery?.string || null

</script>



<div class="wrapper">

	{#if checkout}

		<div>
			<div class="totals sub {checkout ? 'checkout' : ''}">
				<div class="label-wrapper">
					<span class="label">Subtotal</span>
				</div>

				{#if totalsLoading}

					<div aria-busy="true"></div>

				{:else if subTotal}

					{#if promoStatuses && promoStatuses.hasPriceDiscount}

						<div class="promo">
							<span>{discountSubTotal}</span>
							<span>{subTotal}</span>
						</div>

					{:else}

						<span>{subTotal}</span>

					{/if}

				{:else}

					<span>-</span>

				{/if}

			</div>

			{#if fulfillmentName == 'delivery'}
			
				<div class="totals delivery-fee">
					<div class="label-wrapper">
						<span class="label">Delivery Fee</span>
					</div>

					{#if totalsLoading}

						<div aria-busy="true"></div>

					{:else if deliveryFee}

						{#if deliveryChargeThresholdNumber && subTotalNumber && deliveryChargeThresholdNumber <= subTotalNumber}

							<div class="free">
								<span>FREE</span>
								<span>{deliveryFee}</span>
							</div>

						{:else if promoStatuses && promoStatuses.hasDeliveryDiscount}

							<div class="promo">
								<span>{deliveryTotal}</span>
								<span>{deliveryFee}</span>
							</div>

						{:else}

							<span>{deliveryFee}</span>

						{/if}

					{:else}

						<span>-</span>

					{/if}

				</div>
			
			{/if}

			<div class="totals tax">
				<div class="label-wrapper">
					<span class="label">Taxes</span>
				</div>

				{#if totalsError}

					<span>(could not calculate taxes)</span>

				{:else if totalsLoading}

					<div aria-busy="true"></div>

				{:else if tax}

					<span>{tax}</span>

				{:else if !locationKnown}

					<span>(awaiting address)</span>

				{:else}

					<span>(could not calculate taxes)</span>

				{/if}

			</div>
			<div class="totals grand">
				<div class="label-wrapper">
					<span class="label">Total</span>
				</div>

				{#if totalsLoading}

					<div aria-busy="true"></div>

				{:else if tax && total}

					{#if fulfillmentName == 'delivery'}

						<span>{totalWithDelivery}</span>

					{:else}

						<span>{total}</span>

					{/if}

				{:else}

					{#if fulfillmentName == 'delivery'}

						{#if promoStatuses && promoStatuses.hasPriceDiscount}

							<span>{discountSubTotalWithDelivery} <span>(+tax)</span></span>

						{:else}

							<span>{subTotalWithDelivery} <span>(+tax)</span></span>

						{/if}

					{:else}

						{#if promoStatuses && promoStatuses.hasPriceDiscount}

							<span>{discountSubTotal} <span>(+tax)</span></span>

						{:else}

							<span>{subTotal} <span>(+tax)</span></span>

						{/if}

					{/if}

				{/if}

			</div>
		</div>

	{:else}

		<A route="checkout" button action={l.closeMenu} disabled={count > 0 ? undefined : true}>Continue to Checkout</A>

		<div>
			<div class="totals sub {checkout ? 'checkout' : ''}">
				<div class="label-wrapper">
					<span class="label">Subtotal</span>
				</div>

				{#if subTotal}

					<span>{subTotal}</span>
			
				{:else}

					<span>$0.00</span>

				{/if}
			
			</div>
			<div class="totals tax">
				<div class="label-wrapper">
					<span class="label">Taxes</span>
				</div>
				<span>(calculated at checkout)</span>
			</div>
			<div class="totals grand">
				<div class="label-wrapper">
					<span class="label">Total</span>
				</div>

				{#if subTotal}
				
					<span>{subTotal} <span>(+tax)</span></span>

				{:else}

					<span>$0.00</span>

				{/if}

			</div>
		</div>

	{/if}

</div>



<style lang="sass">

	.wrapper
		@include flex-col(3rem)

		> div
			@include flex-col(.25rem)

			.totals
				min-height: 4rem
				padding-bottom: .25rem
				font-weight: 600
				@include flex-row-middle-between

				> *
					flex-grow: 0

				.label-wrapper
					@include flex-row-middle-left(.5rem)

					.label
						font-size: 1.25rem

				.promo,
				.free
					@include flex-col-middle-right(.5rem)

					span:last-child
						font-weight: 400
						text-decoration: line-through

				&:not(:last-child, .grand)
					border-bottom: 1px solid var(--cm-border)
					
				&.sub

					&.checkout
						padding-top: 1rem

				&.grand
					padding-bottom: 0

					span:last-child
						font-size: 1.25rem
						color: var(--cm-text-money)

						span
							font-weight: 400
							font-size: 1rem

</style>