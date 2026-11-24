<script lang="ts">

	import { account } from 'src/features/pages/account/store'
	import { routes } from 'src/lists/routes'
	import { classes } from 'src/lib/helpers'
	import A from 'src/components/elements/a.svelte'

	

	// options
	export let linkless: boolean	= false	// removes link  
	export let small: boolean		= false	// uses small logo
	export let dark: boolean		= false	// uses dark logo
	export let primary: boolean		= false	// uses primary logo

	$: href = !linkless ? ($account.active.type ? routes.pathname('default') : '/') : undefined

	$: _ = classes({small},{dark},{primary})

</script>



{#if linkless}

	<div class="brand-wrapper">
		<brand class={_}></brand>
	</div>

{:else}

	<A {href} c="brand-wrapper" wrapper>

		<brand class={_}></brand>

	</A>

{/if}


<style lang="sass">

	:global(.brand-wrapper)
		@include fill
		@include flex-row-middle-center

		brand
			display: block
			width: 100%
			padding-top: 31%
			background-position: center
			background-size: contain
			background-image: $logo-lg-light  // Default: large and light

			&.dark
				background-image: $logo-lg-dark

			&.primary
				background-image: $logo-lg-primary

			&.small
				background-image: $logo-sm-light

				&.dark
					background-image: $logo-sm-dark

				&.primary
					background-image: $logo-sm-primary

</style>