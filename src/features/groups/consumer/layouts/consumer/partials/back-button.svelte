<script>

	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { isStandaloneMode } from 'src/lib/pwa'
	import { routes } from 'src/lists/routes'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	let visible = false

	$: visible = isStandaloneMode() && $page.url.pathname !== '/'

	function goBack() {

		if	(window.history.length > 1)	window.history.back()
		else							goto(routes.consumerDefaultPathname)
	}

</script>



{#if visible}

	<div class="back-button-wrapper">

		<Button action={goBack} c="pwa-back-button" round>

			<Icon name="chevronLeft" size="3rem" />

		</Button>

	</div>

{/if}



<style lang="sass">

	:global(.pwa-back-button)
		border: 1px solid var(--cm-background) !important

	.back-button-wrapper
		z-index: 9999
		@include fixed-bottom-left(1rem)

</style>
