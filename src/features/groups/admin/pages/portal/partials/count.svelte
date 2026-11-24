<script lang="ts">

	export let data:			any
	export let filteredCount:	number

	let text: string|null = null

	$: {

		if (data?.length) {

			if (data?.length == filteredCount)
				text = `count ${data.length}`
			else
				text = `showing ${filteredCount} of ${data.length}`
		}

	}

</script>



{#if text}

	<span>{text}</span>

{/if}



<style lang="sass">

	span
		min-width: fit-content
		@include flex-row-middle-right(.5rem)

	
	@media (min-width: #{breakpoint('md')})

		span
			gap: 1rem

</style>
