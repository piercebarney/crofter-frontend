<script lang="ts">

	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let openHours = ''

	// Define days of the week
	const daysOfWeek = [
		{name:'mon',	title:{short:'Mon',	long:'Monday'}},
		{name:'tue',	title:{short:'Tue',	long:'Tuesday'}},
		{name:'wed',	title:{short:'Wed',	long:'Wednesday'}},
		{name:'thu',	title:{short:'Thu',	long:'Thursday'}},
		{name:'fri',	title:{short:'Fri',	long:'Friday'}},
		{name:'sat',	title:{short:'Sat',	long:'Saturday'}},
		{name:'sun',	title:{short:'Sun',	long:'Sunday'}}
	]

	// Store weekly hours as an object with day names as keys
	let weeklyHours: { [key: string]: { start: string, end: string } } = {}

	// Initialize or parse existing openHours data
	try {

		if (openHours && typeof openHours === 'string' && openHours.trim() !== '') {

			const parsed = JSON.parse(openHours)

			if (typeof parsed === 'object' && parsed !== null)	weeklyHours = parsed
			else												console.error('Parsed openHours is not an object', parsed)
		}

	} catch (e) {

		console.error('Failed to parse openHours as JSON', e)
	}

	// Ensure all days have default values if not set
	daysOfWeek.forEach(day => {

		if (!weeklyHours[day.name]) weeklyHours[day.name] = { start: '00:00', end: '00:00' }
	})

	// Function to update openHours string whenever a time changes
	const updateOpenHours = () => openHours = JSON.stringify(weeklyHours)

	const clear = (day:string) => {

		weeklyHours[day] = { start: '00:00', end: '00:00' }

		updateOpenHours()
	}

	$: isMin = $layout.size == 'min'

</script>

<div class="open-hours-wrapper">
	<span>Open Hours</span>
	<div>
		<div class="days">

			{#each daysOfWeek as day (day)}

				<span>{#if isMin}{day.title.short}{:else}{day.title.long}{/if}</span>

			{/each}

		</div>
		<div class="hours">

			{#each daysOfWeek as day (day)}

				<div>
					<input type="time" id="{day.name}-start" bind:value={weeklyHours[day.name].start} on:change={updateOpenHours}>
					<span>to</span>
					<input type="time" id="{day.name}-end" bind:value={weeklyHours[day.name].end} on:change={updateOpenHours}>

					<Button action={() => clear(day.name)} c="inverse" role="link">

						{#if isMin}

							<Icon name="x" />

						{:else}
							
							<span>Clear</span>

						{/if}
					
					</Button>

				</div>

			{/each}

		</div>
	</div>
	<input type="hidden" name="openHours" bind:value={openHours} />
</div>

<style lang="sass">

	.open-hours-wrapper
		width: 100%

		> span
			display: inline-block
			margin: 1rem 0 .75rem
			font-size: 1.5rem
			font-weight: 600

		> div
			@include flex-row-left(.75rem)

			.days
				justify-content: space-around
				@include flex-col
				
				span
					flex-grow: 0
					font-weight: 600

			.hours
				@include flex-col(.75rem)

				> div
					stroke: var(--cm-text)
					@include flex-row-middle-between(.5rem)

					input
						height: fit-content
						padding: .5rem
					
					input[type="time"]::-webkit-calendar-picker-indicator
						margin-left: 1.5rem
						padding: 0


	@media (min-width: #{breakpoint('md')})

		.open-hours-wrapper
			
			> div

				.hours

					> div
						gap: .75rem

						input
							padding: 1rem
				
</style>
