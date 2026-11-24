<script lang="ts">

	import { onMount } from 'svelte'
	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company	= $modal.data.company
	const companyId	= $company.id
	const values	= $modal.values ?? {variantId:'', code:'', canPickUp:false, canDeliver:false, active:true}

	let formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= $modal.values ? true : false,
		optionsVariants: any[]			= []

	const onSuccess = (data:any) => {

		company.addSku(data)
		
		modal.close()
	}

	const onFailure = () => buttonReset()

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

	onMount(async () => optionsVariants = await company.variantOptions())

</script>



<Container label="Add SKU" closeButtonText="Cancel" {modal}>

	<Form action="/d/stock?/skuAdd" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure}>

		<input type="hidden" name="keeper_id" value={companyId} />

		<Select options={optionsVariants} name="variant_id" placeholder="Variant" bind:value={values.variantId}/>	

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