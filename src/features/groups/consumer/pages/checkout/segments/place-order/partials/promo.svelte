<script lang="ts">

	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let promoCodeInput: string
	export let promoButtonLoading: boolean
	export let promoInvalid: boolean
	export let promoInelegible: boolean
	export let promo: any
	export let itemsSig: string
	export let fetchTotals: (sig:string, promoCode?:string|null) => void

	const managePromoCode = (e:KeyboardEvent) => e && e.key == 'Enter' && setTimeout(applyPromoCode, 0)

	const applyPromoCode = () => {

		promoButtonLoading = true

		fetchTotals(itemsSig, promoCodeInput)
	}

	const clearPromoCode = () => {

		promo = null

		c.setPromoCode(null)

		fetchTotals(itemsSig)
	}

	$: totalPromo = promo && (promo.priceReduction || promo.priceRatio < 1)

</script>



<div class="wrapper">

	{#if totalPromo}

		<div class="code">
			<span><b>Promotion Applied:</b> {promo.code}</span>
			
			<Button action={clearPromoCode} style="line-height:0" wrapper>

				<Icon name="x" size=".6rem" />

			</Button>

		</div>

	{/if}

	<div class="input" class:invalid={promoInvalid} class:inelegible={promoInelegible}>
		<div>
			<input type="text" name="promoCode" placeholder="Promotion Code" bind:value={promoCodeInput} on:keypress={managePromoCode} />
			<div>

				<Button action={applyPromoCode} loading={promoButtonLoading} disabled={promoCodeInput == ''} thin>Apply</Button>
			
			</div>
		</div>
		<span class="invalid">Invalid Promotion Code</span>
		<span class="inelegible">Ineligible for Promotion</span>
	</div>
</div>



<style lang="sass">

	.wrapper
		width: 100%

		.code
			margin: 0 auto
			margin-bottom: .5rem
			width: fit-content
			border: 1px solid var(--cm-border)
			border-radius: 16rem
			background-color: var(--cm-background-secondary)
			padding: .25rem .5rem
			line-height: normal
			color: var(--cm-text-light)
			stroke: var(--cm-text-light)
			@include flex-row-middle-center(.5rem)

		.input
			width: 100%
			@include flex-col(.5rem)
			
			> div
				@include flex-row(.5rem)
				
				input
					height: 2.375rem

			span
				display: none
				padding-left: 1.25rem
				color: var(--cm-danger)

			&.invalid

				span.invalid
					display: inline-block !important

			&.inelegible

				span.inelegible
					display: inline-block !important


	@media (min-width: #{breakpoint('md')})

		.wrapper

			.code
				float: right

			.input
				clear: right
				float: right
				max-width: 20rem

</style>