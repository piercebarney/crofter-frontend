<script lang="ts">

	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Button from 'src/components/elements/button.svelte'
	import PickUpLocation from 'src/features/groups/consumer/pages/checkout/partials/pick-up-loaction.svelte'



	export let pickUpLocationId: string|null

</script>



<div class="location-wrapper">
	<div class="note">
		<div>

			<Icon name="shop" size="2rem" />

		</div>
		<div>
			<span>Available only in Salt Lake County and Utah County.</span>
			<span>Order by 8 p.m. for pickup the next morning starting at 8 a.m. Orders after 8 p.m. are available the following morning. No pickups on Sundays.</span>
			<span><b>Farmer's Market pickup is only available on the day of the market.</b></span>
			<span>Please see our fulfillment policy below for more details.</span>
		</div>
	</div>

	{#if pL.get(pickUpLocationId)}

		<PickUpLocation {pickUpLocationId} />

		<Button modal="pick-up-locations" c="inverse" role="link">Choose a Different Pickup Location</Button>

	{:else}

		<Button modal="pick-up-locations" thin>Choose a Pickup Location</Button>

	{/if}

	<span style="display:contents"></span>
</div>



<style lang="sass">

	.location-wrapper
		@include flex-col-left(.5rem)

		.note
			background-color: var(--cm-background-secondary)
			border-radius: var(--pico-border-radius)
			padding: 1rem
			stroke: var(--cm-text)
			@include flex-row-middle-left(1rem)

			> div
				@include flex-col-left(.25rem)

				span
					display: inline-block
					font-size: .8rem
					line-height: 1.4

				span:first-child
					font-size: 1.2rem
	
</style>