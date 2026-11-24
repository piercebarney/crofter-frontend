<script lang="ts">

	// import { statuses } from 'src/features/groups/consumer/pages/home/helpers'
	// import { statuses } from 'src/features/groups/consumer/pages/home/helpers'
	import LiWrapper from 'src/features/modules/header/segments/wrappers/li.svelte'
	import Brand from 'src/components/elements/brand.svelte'
	// import FulfillmentSlider from 'src/features/groups/consumer/modules/fulfillmentSlider.svelte'
	import CartButton from 'src/features/groups/consumer/modules/cart/button.svelte'
	import Account from 'src/features/modules/header/units/account/unit.svelte'



	// options
	export let showAccount: boolean
	export let showCart: boolean
	// export let isMobile: boolean
	// export let init: boolean
	// export let showDiscovery: boolean
	// export let fulfillment: string|null

	// $: queryParamsChecked	= $statuses.queryParamsChecked

</script>



<LiWrapper brand>

	<Brand />

</LiWrapper>

<LiWrapper search />

<!-- {#if !isMobile && init && showDiscovery && fulfillment && queryParamsChecked}

	<LiWrapper>

		<FulfillmentSlider inverse />

	</LiWrapper>

{/if} -->

{#if showCart}

	<LiWrapper>

		<CartButton />

	</LiWrapper>

{/if}

{#if showAccount}

	<LiWrapper>

		<Account />

	</LiWrapper>

{/if}