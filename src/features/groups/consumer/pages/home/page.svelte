<script lang="ts">

	import type { Modal } from 'src/features/modules/modal/types'

	import { PUBLIC_TITLE } from '$env/static/public'
	import { afterNavigate } from '$app/navigation'
	import { browser } from '$app/environment'
	import { onDestroy } from 'svelte'
	import { onMount } from 'svelte'
	import { modal } from 'src/features/modules/modal/store'
	import { layout as l } from 'src/stores/layout'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { meta } from 'src/stores/meta'
	import { statuses, checkQueryParams, updateQueryString, resetStatuses } from './helpers'
	import Hero from 'src/features/groups/consumer/pages/home/units/hero/unit.svelte'
	import SubHero from 'src/features/groups/consumer/pages/home/units/sub-hero/unit.svelte'
	import Products from 'src/features/groups/consumer/pages/home/units/products/unit.svelte'
	import A from 'src/components/elements/a.svelte'



	$: queryParamsChecked	= $statuses.queryParamsChecked
	$: currentZipCode		= $statuses.currentZipCode
	$: isMobile				= $l.isMobile
	$: cartHasItems			= $c.count > 0


	// Update Query String
	$: queryParamsChecked && updateQueryString(currentZipCode)


	// Check Query Params
	afterNavigate((navigation) => browser && checkQueryParams(navigation))


	// Reset Statuses and clear interval
	onDestroy(resetStatuses)


	// Fetch products
	onMount(() => {

		modal.onOpenByName('product', (m:Modal) => updateQueryString($statuses.currentZipCode, {skuId:m.data?.skuId}))
		modal.onOpenByName('producer', (m:Modal) => updateQueryString($statuses.currentZipCode, {companyId:m.data?.companyId}))
		modal.onCloseByName('product', () => updateQueryString($statuses.currentZipCode, {closing:true}))
		modal.onCloseByName('producer', () => updateQueryString($statuses.currentZipCode, {closing:true}))
	})

</script>



<svelte:head>

	<title>{PUBLIC_TITLE}</title>

	{@html meta.make()}

</svelte:head>



<div class="home-wrapper">

	<Hero />

	<SubHero />

	<Products />

	{#if isMobile && cartHasItems}

		<div class="checkout-button">

			<A route="checkout" button boarder tall>Checkout</A>

		</div>

	{/if}

</div>



<style lang="sass">

	.home-wrapper
		height: 100%
		padding-bottom: 3rem
		@include flex-col-top(3rem)

		.checkout-button
			z-index: 100
			position: fixed
			bottom: 20px
			left: 50%
			transform: translateX(-50%)
		
</style>