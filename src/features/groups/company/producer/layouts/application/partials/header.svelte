<script lang="ts">

	import { layout } from 'src/stores/layout'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import AccountButton from 'src/features/modules/header/units/account/partials/button.svelte'



	export let routeName: string

	let headerElement: HTMLElement

	$: isMobile = $layout.isMobile

	$: if (headerElement && $layout.width) {
		
		const mainHeight = headerElement?.offsetHeight

		layout.setDeep({header:{mainHeight, searchHeight: 0, heightWithSearch: mainHeight, heightWithoutMain: 0}})
	}
	
</script>



<header bind:this={headerElement}>
	<div>

		{#if isMobile && routeName.includes('application-product-')}

			<A route="application-products" c="application-products-back-button" wrapper>

				<Icon name="chevronLeft" size="1.5rem" />
			
				<span>Back to Products</span>

			</A>

		{/if}

	</div>
	<div class="account">
		
		<AccountButton alwaysShowName application />

	</div>
</header>



<style lang="sass">

	:global(.application-products-back-button)
		@include flex-row-middle-left(.5rem)

	:global(.producer-account-button-wrapper)
		flex-grow: 0
		min-width: max-content
		@include flex-row-middle(1rem)

	header
		flex-grow: 0
		border-bottom: 1px solid #EFEFEF
		padding: .5rem 2rem
		background-color: #FFFFFF
		@include flex-row-middle(1.5rem)

		> div
			line-height: 1.2

		.account
			flex-grow: 0
			stroke: var(--cm-text)


	@media (min-width: #{breakpoint('sm')})

		header
			padding: .5rem 3rem


	@media (min-width: #{breakpoint('md')})

		:global(.application-products-back-button)
			display: none

		header
			padding: 1rem 2rem


	@media (min-width: #{breakpoint('xl')})

		header
			padding: 1rem 3rem

</style>