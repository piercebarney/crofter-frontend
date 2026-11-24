<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { layout as l } from 'src/stores/layout'



	export let pickUpLocationId: string|null	= null
	export let location: PickUpLocation|null	= null
	export let method: boolean					= false
	// export let hours: boolean					= true
	// export let shortHours: boolean				= false
	export let button: boolean					= false
	
	$: layoutSize = $l.size

	$: pickUpLocationId && (location = pL.get(pickUpLocationId))
	
</script>



<div class="location-details-wrapper {button ? 'button' : ''}">
	<div class="location">
		<div class="name">
			<span class="title">{location?.title.toUpperCase()}</span>

			{#if method}

				<span class="type">PICKUP</span>

			{/if}

		</div>
		<div class="address">

			{#if layoutSize == 'min'}

				<span>{location?.address.asSplit[0]}</span>
				<span>{location?.address.asSplit[1]}</span>

			{:else}

				<span>{location?.address.asString}</span>

			{/if}

		</div>
	</div>

	<!-- {#if location?.openHours && (shortHours || hours)}

		<div class="hours">
			<div class="label">
				<span>Pickup Times</span>
			</div>
			<div class="days">

				{#if hours}

					{#each location?.openHours.array as hours}

						<div>
							<span class="day">{hours.day}</span>
							<span class="time">{hours.time}</span>
						</div>

					{/each}

				{:else}

					<span class="short">{@html location?.openHours.string}</span>

				{/if}

			</div>
		</div>

	{/if} -->

</div>



<style lang="sass">

	.location-details-wrapper
		border-bottom: 1px solid var(--cm-border)
		padding-bottom: .5rem
		@include fill
		@include flex-col-left(.4rem)

		&.button
			padding: .5rem
			line-height: normal
			
			&:hover
				background-color: var(--cm-background-secondary)
		
		.location
			min-width: 0
			flex-shrink: 1
			@include flex-col-middle-left(.4rem)
			
			.name
				flex-wrap: wrap
				@include flex-row-middle-left(.4rem)

				.title
					font-size: 1.2rem
					font-weight: 600
					line-height: 1.4
					word-break: break-word
					overflow-wrap: break-word

				.type
					color: var(--cm-primary)

			.address
				// color: var(--cm-text-secondary-dark)

				> span
					display: block
					line-height: 1.2

		// .hours
		// 	@include flex-col-middle-left(.4rem)

		// 	.label
		// 		font-weight: 600

		// 	.days
		// 		font-size: .8rem
		// 		@include flex-col-left(.4rem)

		// 		> div

		// 			.day
		// 				font-weight: 600

		// 			.time
		// 				color: var(--cm-text-secondary-dark)

		// 		> span
		// 			font-weight: 300


	@media (min-width: #{breakpoint('xs')})

		.location-details-wrapper

			.location

				.name

					.title
						flex-grow: 0

					.type
						font-size: 1.4rem

				.address
					font-size: 1rem

			// .hours

			// 	.days
			// 		@include flex-row-left(.4rem)

			// 		> div
			// 			flex-grow: 0


	@media (min-width: #{breakpoint('md')})

		.location-details-wrapper
			@include flex-row-left(4rem)

			.location
				flex: 2

			// .hours
			// 	flex: 1

			// 	.label
			// 		font-size: 1.2rem

			// 	.days
			// 		font-size: 1rem

			// 		> span
			// 			font-weight: 400

</style>