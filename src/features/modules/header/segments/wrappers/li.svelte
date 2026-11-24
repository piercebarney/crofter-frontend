<script lang="ts">

	import { classes } from 'src/lib/helpers'

	export let checkout:	boolean = false
	export let brandMobile:	boolean = false
	export let brand:		boolean = false
	export let search:		boolean = false
	export let withDiv:		boolean = false

	$: _ = classes((brandMobile ? 'brand-mobile' : undefined), {checkout}, {brand}, {search})

</script>



{#if checkout || withDiv || brandMobile || brand || search}

	<li class={_}>

		<div>

			<slot />

		</div>

	</li>

{:else}

	<li class={_}>

		<slot />

	</li>

{/if}



<style lang="sass">

	li
		position: relative
		height: 100%

		&.checkout
			margin: 0

			> div
				height: 100%
				min-width: 8rem

		&.brand-mobile
			max-width: var(--c-header-brand-width)
			width: var(--c-header-brand-width)

			> div
				height: 100%

		&.brand
			min-width: var(--c-header-brand-width)
			margin-right: var(--c-header-brand-margin)

			> div
				height: 100%
				min-width: 8rem

		&.search
			flex-grow: 1
			margin: var(--c-header-search-margin)
			min-height: var(--c-header-search-min-height)

			> div
				position: relative
				height: 100%
				max-width: 700px

</style>
