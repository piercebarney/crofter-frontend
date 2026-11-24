<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company					= $modal.data.company
	const optionsStorageLocation	= company.storageLocationOptions()
	const optionsSku				= company.skuOptions()
	const values					= $modal.values ?? {storage_location_id:'', sku_id:'', count:0, maxCapacity:0}

	let formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= $modal.values ? true : false

	const onSuccess = (data:any) => {

		company.addStockItem(data)
		
		modal.close()
	}

	const onFailure = () => buttonReset()

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Add Stock Item" closeButtonText="Cancel" {modal}>

	<Form action="/d/stock?/stockItemAdd" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure}>

		<div class="select-wrapper">

			<Select options={optionsStorageLocation} name="storage_location_id" placeholder="Storage Location" bind:value={values.storage_location_id}/>

			<Button modal="storage-location-add" data={{values, company}} role="link" inverse>Add Storage Location</Button>

			<span style="display:contents"></span>
		</div>	
		<div class="select-wrapper">

			<Select options={optionsSku} name="sku_id" placeholder="SKU" bind:value={values.sku_id}/>

			<Button modal="sku-add" data={{values, company}} role="link" inverse>Add SKU</Button>

			<span style="display:contents"></span>
		</div>
		<div class="form-row">
			<fieldset>
				<span>Max Capacity</span>
				<input type="number" name="max_capacity" placeholder="Max Capacity" bind:value={values.maxCapacity}/>
			</fieldset>
			<fieldset>
				<span>Count</span>
				<input type="number" name="count" placeholder="Count" bind:value={values.count}/>
			</fieldset>
		</div>

	</Form>

	<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange}>Save</Button>
	
</Container>



<style lang="sass">

	.select-wrapper
		width: 100%
		@include flex-col-left(.25rem)

	fieldset

		> span
			display: block
			margin-bottom: .25rem

</style>