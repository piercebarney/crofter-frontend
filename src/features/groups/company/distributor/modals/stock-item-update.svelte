<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company					= $modal.data.company
	const optionsStorageLocation	= company.storageLocationOptions()
	const optionsSku				= company.skuOptions()
	const stockItem					= $modal.data.stockItem
	const stockItemId				= stockItem.id
	const storageLocation			= optionsStorageLocation.find((a:any) => a.value == stockItem.storageLocationId)
	const sku						= optionsSku.find((a:any) => a.value == stockItem.skuId)
	const values					= $modal.values ?? {...stockItem}

	let formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= $modal.values ? true : false

	const onSuccess = (data:any) => {

		company.setStockItem(stockItemId, data)
		
		modal.close()
	}

	const onFailure = () => buttonReset()

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Edit Stock Item" closeButtonText="Cancel" {modal}>

	<Form action="/d/stock?/stockItemUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure}>

		<input type="hidden" name="id" value={stockItemId}/>
		<div class="display-wrapper">
			<span>Storage Location</span>
			<span>{storageLocation?.option}</span>
		</div>	
		<div class="display-wrapper">
			<span>SKU</span>
			<span>{sku?.option}</span>
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

	.display-wrapper

		span
			display: block
			line-height: 1.2

		span:first-child
			margin-bottom: .25rem

	fieldset

		> span
			display: inline-block
			margin-bottom: .5rem

</style>