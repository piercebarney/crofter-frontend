<script lang="ts">

	import Form from 'src/components/elements/form.svelte'
	import InputPassword from 'src/components/elements/input-password.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let formSubmit:	(()=>boolean)
	export let onSuccess:	((resultData:any)=>void)
	export let onFailure:	((error: any)=>void)
	export let formChange:	boolean
	export let name:		string

</script>



<div class="label">
	<span>Let's create an account</span>
	<span>Welcome to Crofter</span>
</div>

<Form action="/register?/newuser" bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure} gap="2.5rem" application>

	<input type="hidden" name="name" bind:value={name} />
	<input type="email" name="email" placeholder="*Email" autocomplete="email" required />

	<InputPassword signup required />

	<input type="text" name="zipCode" placeholder="*Zip Code" autocomplete="postal-code" required />
	<fieldset name="terms">
		<input type="checkbox" id="terms" name="terms" required />
		<span>
			I have read and agree to the <Button modal="terms" type="button" role="link" c="register-new-user-terms">Terms and Conditions</Button>
		</span>
	</fieldset>

</Form>



<style lang="sass">

	:global(.register-new-user-terms)
		font-weight: 700

		&:hover
			color: #468047

	.label

		> span
			display: block

			&:first-child
				margin-bottom: 1.5rem
				font-size: 3rem
				font-weight: 600

			&:last-child
				font-size: 1.5rem
				font-weight: 400
				line-height: 1.2
				color: var(--cm-text-secondary)

	fieldset
		padding: 2.25rem 1.5rem
		border-radius: var(--pico-border-radius)
		background-color: #F9F9F9
		@include flex-row-middle(1rem)

		> input
			flex-grow: 0
			border: 1px solid #CDCFCF
			background-color: transparent
			@include min-area(2rem)

			&:where(:checked)
				border-color: #468047
				background-color: #468047

	
	@media (min-width: #{breakpoint('lg')})

		.label

			> span

				&:first-child
					font-size: 2.5rem

				&:last-child
					font-size: 1.15rem


	@media (min-width: #{breakpoint('xl')})

		.label

			> span

				&:first-child
					font-size: 3rem

				&:last-child
					font-size: 1.5rem
</style>