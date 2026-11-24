<script lang="ts">

	import { layout } from 'src/stores/layout'
	import CartItem from './item.svelte'



	export let orderItems: any[]
	export let fulfillment: any
	export let statusDetails: any
	export let pickUpLocations: any

	$: isMobile			= $layout.isMobile
	$: fulfilled		= statusDetails.fulfilled
	$: itemCount		= statusDetails.itemCount
	$: orderedCount		= statusDetails.orderedCount
	$: readyCount		= statusDetails.readyCount
	$: fulfillmentName	= fulfillment.fulfillment
	$: location			= fulfillmentName == 'pickup' ? pickUpLocations.get(fulfillment.id) : null

</script>



<div class="inner-wrapper">
	<div class="header">
		<div class="title">
			<div>
				<span class="type">{fulfillmentName.toUpperCase()}</span>

				{#if location?.title}

					<span>{location?.title}</span>

				{/if}

			</div>
		</div>
		<span class="status">
									
			{#if fulfilled}

				{#if fulfillmentName == 'pickup'}

					Completed

				{:else}

					Delivered

				{/if}

			{:else if itemCount == orderedCount}

				Order Placed

			{:else if itemCount == readyCount}
			
				{#if fulfillmentName == 'pickup'}
				
					Ready for Pickup
				
				{:else}
			
					Ready for Delivery
	
				{/if}
		
			{/if}
		
		</span>
	</div>

	{#if location?.id && !fulfilled}

		<div class="location">

			{#if itemCount > readyCount}

				<span class="note">Your order is not yet ready to be picked up.</span>
			
			{/if}

			<div class="address">

				{#if isMobile}

					<span>{location.address.asSplit[0]}</span>
					<span>{location.address.asSplit[1]}</span>

				{:else}

					<span>{location.address.asString}</span>

				{/if}

			</div>
			<div class="days">

				{#each location?.openHours.array as hours (hours)}

					<div>
						<span class="day">{hours.day}</span>
						<span class="time">{hours.time}</span>
					</div>

				{/each}

			</div>
		</div>

	{/if}

	<div class="items-wrapper">

		{#each orderItems as orderItem (orderItem)}

			<div class="item">

				<CartItem {orderItem} />

			</div>

		{/each}

	</div>
</div>



<style lang="sass">

	.inner-wrapper
		border: 2px solid var(--cm-secondary)
		border-radius: var(--pico-border-radius)

		.header
			padding: 1rem
			background-color: var(--cm-secondary)
			@include flex-col(.5rem)
			
			.title
				@include flex-row-middle-left(1rem)

				> div

					> span
						display: block

					.type
						font-size: 1.2rem
						font-weight: 600

			.status
				font-size: 1.2rem
				font-weight: 600

		.location
			padding: .5rem .5rem 0
			@include flex-col-left(.5rem)

			.note
				font-size: 1.2rem !important
				color: var(--cm-danger)

			.address

				> span
					display: block
					line-height: 1.2

			.days
				width: 100%
				border-bottom: 1px solid var(--cm-border)
				padding-bottom: .5rem
				@include flex-col-left(.5rem)

				> div

					.day
						font-weight: 600

		.items-wrapper
			padding: .5rem
			@include flex-col(.5rem)

			.item
				border-bottom: 1px solid var(--cm-border)
				padding-bottom: .5rem

				&:last-child
					border-bottom: none
					padding-bottom: 0

	
	@media (min-width: #{breakpoint('xs')})

		.inner-wrapper

			.header
				padding: 1rem
				@include flex-row-middle-between(1rem)

				.status
					font-size: 1.25rem
					font-weight: 600

			.location
				padding: 1rem 1rem 0

				.note
					font-size: .8rem

				.address
					font-size: 1.2rem

				.days
					width: 100%
					padding-bottom: 1rem
					@include flex-row-left(.5rem)

					> div
						flex-grow: 0

						.day
							font-weight: 600

			.items-wrapper
				padding: 1rem
				gap: 1rem

				.item
					padding-bottom: 1rem


	@media (min-width: #{breakpoint('sm')})

		.inner-wrapper

			.header
				
				.title

					> div
						@include flex-row-middle-left(.5rem)

						> span
							font-size: 1.2rem

						.type
							font-size: 1.5rem


	@media (min-width: #{breakpoint('md')})

		.inner-wrapper

			.header
				
				.title

					> div

						> span
							font-size: 1.5rem

</style>
