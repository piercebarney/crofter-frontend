<script lang="ts">

	import type { Fulfillment } from 'src/features/groups/consumer/pages/home/types.d.ts'

	import { reporter } from 'src/lib/reporter/module'
    import { browser } from '$app/environment'
	import { onDestroy } from 'svelte'
	import { type FulfillmentStatus, cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { user as u } from 'src/stores/user'
	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { gA4 } from 'src/lib/gA4'
	import { fulfillmentTypesCheck, clearFulfillmentTypeCheck, setFulfillmentDetails, clearFulfillmentDetails, validationCheck } from 'src/features/groups/consumer/pages/checkout/segments/place-order/helpers'
	import Container from 'src/features/groups/consumer/pages/checkout/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Products from 'src/features/groups/consumer/modules/cart/partials/products.svelte'
	import Slider from 'src/components/elements/slider.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Totals from 'src/features/groups/consumer/modules/cart/partials/totals.svelte'
	import Promo from 'src/features/groups/consumer/pages/checkout/segments/place-order/partials/promo.svelte'
	import PickUp from 'src/features/groups/consumer/pages/checkout/segments/place-order/partials/pick-up.svelte'
	import Delivery from 'src/features/groups/consumer/pages/checkout/segments/place-order/partials/delivery.svelte'
	import Phone from 'src/features/groups/consumer/pages/checkout/segments/place-order/partials/phone.svelte'
	import Billing from 'src/features/groups/consumer/pages/checkout/segments/place-order/partials/billing.svelte'
	import PaymentInfo from 'src/features/groups/consumer/modals/payment-info/manager.svelte'
	import Button from 'src/components/elements/button.svelte'
	import P from 'src/components/elements/p.svelte'
	import FulfillmentPolicy from 'src/components/copy/policies/fulfillment.svelte'


	
	export let order: number
	export let index: number

	const reportError				= reporter({type:'error', file:'/src/features/groups/consumer/pages/checkout/segments/place-order.svelte/segment.svelte'})
	const debounceTimeout			= 600 // 600 milliseconds
	const closeCheckoutTimeout		= 3 * 1000 // 3 seconds
	const hasActivePickUpLocations	= pL.hasActive()
	const fulfillmentOptions		= [
		{name:'delivery',	title:'Delivery',	id:'delivery',	icon:'truck'},
		{name:'pickup',		title:'Pickup',		id:'pick_up',	icon:'shop'}
	]

	let submit: (()=>boolean),
		buttonResetBottom: (()=>void),
		disableAll: boolean						= false,
		loadingAll: boolean						= false,
		deliveryAddressId: string|null			= $u.defaultAddress?.id || null,
		validDeliveryAddress: boolean			= deliveryAddressId ? true : false,
		billingAddressId: string|null			= $u.defaultAddress?.id || null,
		validBillingAddress: boolean			= billingAddressId ? true : false,
		validPayment: boolean					= false,
		paymentMessage: string					= '',
		totalsError: boolean					= false,
		lastTotalsSignature: string				= '',
		lastLocationKnown: boolean|string|null	= null,
		totalsLoading: boolean					= false,
		fetchingTotals: boolean					= false,
		calculateTotalsTimer: any				= null,
		fetchTotalsExecutionId: number			= 0,
		promoInvalid: boolean					= false,
		promoInelegible: boolean				= false,
		fulfillmentOption: Fulfillment|null		= null,
		fulfillmentStatus: FulfillmentStatus	= {hasPickUp:false, hasDelivery:false, hasBoth:false, onlyPickUp:false, onlyDelivery:false, onlyBoth:false},
		submitting: boolean						= false,
		promoCodeInput: string					= '',
		promoButtonLoading: boolean				= false,
		promoStatuses: any						= null,
		promo: any								= null,
		error: string|null						= null,
		passedValidation: boolean				= false,
		previousPlacingOrder: boolean			= false

	const showBillingAddressForm: boolean	= billingAddressId ? false : true

	const formSubmit: (()=>void) = async () => {

		submitting	= true
		disableAll	= true
		loadingAll	= true

		c.refresh()

		await c.whenSynchronized()

		submit()
	}

	const onSuccess = (orderId:string) => {

		gA4.purchase({orderId, fulfillmentName, pickUpLocationId, deliveryAddressId})

		c.clear()

		index++

		setTimeout(() => c.setCheckout(false), closeCheckoutTimeout)
	}

	const onFailure = (errorData: any) => {

		error = errorData || 'There was an error processing your order. Please try again later.'
		
		submitting = false

		reportError({
			message		: error as string,
			args		: {
				uId		: $u.id,
				oIIds	: orderItemsIds,
				c		: count,
				fN		: fulfillmentName,
				pLI		: pickUpLocationId,
				dAI		: deliveryAddressId,
				hP		: hasPhone,
				hVA		: hasValidAddress,
			},
			error		: errorData,
			location	: 'Place Order',
			raw			: {
				userAgent		: navigator.userAgent,
				online			: navigator.onLine,
				cookieEnabled	: navigator.cookieEnabled
			}
		})
	}

	const onFinal = () => {

		disableAll	= false

		buttonResetBottom()	
	}

	const fetchTotals = (sig: string, promoCode:string|null = null, locKnown: boolean|string|null = locationKnown) => {

		// Guard: skip if already fetching or submitting
		if (fetchingTotals || submitting) return
		
		// Only check signature/location when called from reactive statement (no promo code)
		// When promo code is explicitly passed, always recalculate
		if (!promoCode && totalsError) return
		if (!promoCode && sig === lastTotalsSignature && locKnown === lastLocationKnown) return

		totalsError		= false
		totalsLoading	= true

		// debounce: reset timer on every trigger
		clearTimeout(calculateTotalsTimer)

		// Increment execution ID - this call is now the "latest"
		const currentExecutionId = ++fetchTotalsExecutionId

		calculateTotalsTimer = setTimeout(async () => {

			fetchingTotals	= true

			try {

				// Wait for cart to be synchronized before calculating totals
				await c.whenSynchronized()

				// Check if a newer fetchTotals call was made while we were waiting
				if (currentExecutionId !== fetchTotalsExecutionId) {

					fetchingTotals = false

					return // Abort this stale execution
				}

				const totalsResponse = await c.processCheckoutTotal(promoCode)

				totalsLoading		= false
				totalsError			= !!totalsResponse.error
				fetchingTotals		= false
				promoButtonLoading	= false
				lastTotalsSignature	= sig
				lastLocationKnown	= locKnown
				promoStatuses		= totalsResponse.statuses
				promo				= promoStatuses.promoApplied ? totalsResponse.promo : null

				c.setPromoCode(promo?.code || null)

				promoInvalid	= !!(totalsResponse.code && !totalsResponse.promo)
				promoInelegible	= !!(totalsResponse.code && totalsResponse.promo && !promoStatuses.promoApplied)

				if (totalsResponse.code && totalsResponse.promo && !promoStatuses.promoApplied) {

					if (promoCodeInput == '') promoCodeInput = totalsResponse.code

				} else if (totalsResponse.promo) promoCodeInput = ''

			} catch (err) {

				// Sync failed - set error state
				console.error('Cart sync failed before calculating totals:', err)
				
				totalsError			= true
				totalsLoading		= false
				fetchingTotals		= false
				promoButtonLoading	= false
				promoStatuses		= null
				promo				= null
			}

		}, debounceTimeout)
	}

	$: placingOrder			= index === order
	$: submitButtonDisabled	= disableAll || !passedValidation || totalsError ? true : false
	$: count 				= $c.count
	$: hasPhone				= $u.phoneNumber ? true : false
	$: cartItems			= $c.items
	$: orderItemsIds		= count > 0 && cartItems ? c.getItemIds() : ''
	$: itemsSig				= cartItems.length > 0 ? c.getItemSignitures() : ''
	$: fulfillmentName		= fulfillmentOption ? f.name(fulfillmentOption) : null
	$: pickUpLocationId		= $c.preferences.pickUpLocationId
	$: hasValidAddress		= validDeliveryAddress || validBillingAddress
	$: locationKnown		= $u.zipCode || hasValidAddress

	// set validBillingAddress to true if validDeliveryAddress is true
	$: if (validDeliveryAddress) validBillingAddress = true

	// clear promo validation state when promo code is cleared
	$: if (promoCodeInput == '') {

		promoInvalid	= false
		promoInelegible	= false
	}

	// validate for submit button - runs on mount and whenever dependencies change
	$: fulfillmentName, pickUpLocationId, deliveryAddressId, validPayment, count, itemsSig, submitting, runValidation()

	const runValidation = async () => {

		passedValidation = false
		passedValidation = await validationCheck(fulfillmentName, pickUpLocationId, deliveryAddressId, validPayment, count, submitting)
	}

	// validate preferences and fire checkout event only when entering checkout
	$: placingOrder, (() => {

		if (placingOrder && !previousPlacingOrder) {

			c.validatePreferences()

			gA4.checkoutBegin()
		}

		previousPlacingOrder = placingOrder

	})()

	// set fulfillment preference
	$: fulfillmentOption && c.setPreferences({fulfillment:fulfillmentOption})

	// set fulfillment details
	$: setFulfillmentDetails(fulfillmentName, pickUpLocationId, deliveryAddressId, count, submitting, debounceTimeout)

	// clear error state when cart changes
	$: itemsSig && (totalsError = false)

	// update totals when cart items change OR location becomes known
	$: browser && placingOrder && count > 0 && itemsSig && fetchTotals(itemsSig, null, locationKnown)

	// update hasPickUpItems and hasDeliveryItems, and clear checkout if count is 0
	$: count, (() => {
		
		fulfillmentStatus = fulfillmentTypesCheck(count, fulfillmentStatus)

		if		(fulfillmentStatus.onlyDelivery || (fulfillmentStatus.hasDelivery && !fulfillmentStatus.onlyBoth) || !hasActivePickUpLocations)	fulfillmentOption = f.id('delivery')
		else if	(fulfillmentStatus.onlyPickUp)																									fulfillmentOption = f.id('pickup')
		else																																	fulfillmentOption = $c.preferences.fulfillment || f.id('delivery')

		if (count == 0 && !submitting) setTimeout(() => c.setCheckout(false), debounceTimeout)

	})()

	onDestroy(() => {

		clearTimeout(calculateTotalsTimer)

		clearFulfillmentTypeCheck()

		clearFulfillmentDetails()
	})

	// $: console.log('place-order', {fulfillmentName, pickUpLocationId, deliveryAddressId, validPayment, showBillingAddressForm, validDeliveryAddress, validBillingAddress, hasPhone, hasValidAddress, locationKnown})

</script>



<Form action="/checkout?/placeOrder" bind:submit={submit} {onSuccess} {onFailure} {onFinal} {error} errorMessageDisabled>

	<input type="hidden" name="orderItemsIds" value={orderItemsIds} />
	<input type="hidden" name="userId" value={$u.id} />

</Form>

<Container {order} bind:index {formSubmit}>

	<div class="group wide">

		<Products checkout />

		{#if !fulfillmentStatus.onlyDelivery && !fulfillmentStatus.onlyPickUp && !(fulfillmentStatus.hasDelivery && !fulfillmentStatus.onlyBoth) && hasActivePickUpLocations}

			<div class="slider-wrapper">
				<div>

					<Slider options={fulfillmentOptions} bind:id={fulfillmentOption} />

				</div>
			</div>

		{/if}

		{#if fulfillmentName == 'delivery'}

			<div class="delivery-threshold-message">

				<Icon name="truck" size="2rem" />

				<span>Orders over $80 receive <b>free next-day delivery!</b></span>
			</div>

		{/if}

		<div class="group border">

			<Totals checkout {totalsLoading} {locationKnown} {totalsError} {fulfillmentName} {promoStatuses} />

			<Promo bind:promoCodeInput bind:promoButtonLoading {promoInvalid} {promoInelegible} {itemsSig} {fetchTotals} {promo} />

		</div>
		<div class="group border">

			{#if fulfillmentName == 'delivery'}

				<span class="label">Delivery</span>

				<Delivery bind:addressId={deliveryAddressId} bind:validAddress={validDeliveryAddress} />

			{:else if fulfillmentName == 'pickup'}

				<span class="label">Pickup</span>

				<PickUp {pickUpLocationId} />

			{/if}

		</div>

		{#if (fulfillmentName == 'pickup' && pickUpLocationId) || (fulfillmentName == 'delivery' && validDeliveryAddress)}
			
			{#if fulfillmentName != 'delivery' && showBillingAddressForm}

				<div class="group border">

					<span class="label">Billing Address</span>

					<Billing bind:addressId={billingAddressId} bind:validAddress={validBillingAddress} />

				</div>

			{/if}
			
			{#if !showBillingAddressForm || validBillingAddress}

				<div class="group border">

					<span class="label">Contact</span>

					<Phone />

				</div>

			{/if}

			{#if hasPhone && hasValidAddress}

				<div class="group border">

					<span class="label">Payment</span>

					<div class="payment-wrapper">

						<PaymentInfo single bind:valid={validPayment} bind:message={paymentMessage} />

						<span style="display:contents"></span>
					</div>
				</div>

			{/if}

		{/if}

	</div>

	{#if ((fulfillmentName == 'pickup' && pickUpLocationId) || (fulfillmentName == 'delivery' && validDeliveryAddress)) && validPayment}

		<div class="group">

			{#if typeof error == 'string'}

				<P danger center>{error}</P>
			
			{/if}

			<Button {formSubmit} bind:reset={buttonResetBottom} disabled={submitButtonDisabled} loading={loadingAll} tall>Place Order</Button>

			<div class="terms">
				<span>By placing this order, you are agreeing to our</span>

				<Button modal="terms" type="button" role="link" c="inverse">Terms and Conditions</Button>

			</div>
		</div>

	{/if}

	<span class="policy">

		<FulfillmentPolicy />

	</span>

</Container>



<style lang="sass">

	.group
		@include flex-col(1rem)

		&.border
			border: 1px solid var(--cm-border)
			border-radius: var(--pico-border-radius)
			padding: 1rem		

		&.wide
			gap: 2rem

		.label
			font-size: 1.4rem
			font-weight: 600

	.slider-wrapper
		flex-wrap: wrap
		@include flex-row-middle-between(.5rem)

		> div
			width: fit-content

	.delivery-threshold-message
		background-color: var(--cm-background-secondary)
		border-radius: var(--pico-border-radius)
		padding: 1rem
		@include flex-row-middle-left(1rem)
		
	.payment-wrapper
		@include flex-col(1rem)

	.terms
		width: 100%
		text-align: center

	.policy
		color: var(--cm-text-secondary)
		font-size: .8rem

</style>