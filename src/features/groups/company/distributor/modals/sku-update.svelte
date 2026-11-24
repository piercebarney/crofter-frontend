<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company	= $modal.data.company
	const sku		= $modal.data.sku
	const skuId		= sku.id
	const values	= $modal.values ?? {...sku}

	let formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= $modal.values ? true : false

	const onSuccess = (data:any) => {

		company.setSku(skuId, data)
		
		modal.close()
	}

	const onFailure = () => buttonReset()

	$: variantOption = company.variantOptionById(values.variantId)

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Edit SKU" closeButtonText="Cancel" {modal}>

	<Form action="/d/stock?/skuUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure}>

		<input type="hidden" name="id" value={skuId} />
		<div class="display-wrapper">
			<sapn>Variant</sapn>
			<span>{variantOption?.option}</span>
		</div>
		<input type="text" name="code" placeholder="Code" required bind:value={values.code}/>
		<input type="number" name="display_order" placeholder="Display Order" bind:value={values.displayOrder}/>
		<div class="form-row">
			<fieldset name="fulfillment">
				<legend>Allowable Fulfillment Methods</legend>
				<div>
					<input type="checkbox" id="pickup" name="can_pick_up" bind:checked={values.canPickUp}/>
					<label for="pickup">Pickup</label>
				</div>
				<div>
					<input type="checkbox" id="delivery" name="can_deliver" bind:checked={values.canDeliver}/>
					<label for="delivery">Delivery</label>
				</div>
			</fieldset>
			<fieldset name="active">
				<legend></legend>
				<div>
					<input type="checkbox" id="active" name="active" bind:checked={values.active}/>
					<label for="active">Active</label>
				</div>
			</fieldset>
		</div>

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>
	
</Container>



<style lang="sass">

	.display-wrapper

		span
			display: block
			line-height: 1.2

		span:first-child
			margin-bottom: .25rem

	fieldset

		> legend
			display: block
			margin-bottom: .25rem
			min-height: 20px
			@include flex-row-middle-left(.25rem)

		> div
			display: inline-block

			&:not(:last-child)
				margin-inline-end: 1rem

		input:disabled

			+ label
				color: var(--cm-text-secondary)
				cursor: default

		&[name="active"]

			> div
				float: right
</style>