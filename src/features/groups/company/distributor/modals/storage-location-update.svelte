<script lang="ts">

	import { storageLocationTypes as sLT } from 'src/lists/storage-location-types'
	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company			= $modal.data.company
	const companyId			= $company.id
	const optionsAddress	= company.addressOptions()
	const storageLocation	= $modal.data.storageLocation
	const storageLocationId	= storageLocation.id
	const values			= $modal.values ?? {...storageLocation}

	let formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= $modal.values ? true : false

	const onSuccess = (data:any) => {

		company.setStorageLocation(storageLocationId, data)

		modal.close()
	}

	const onFailure = () => buttonReset()

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Storage Location Edit" closeButtonText="Cancel" {modal}>

	<Form action="/d/stock?/storageLocationUpdate" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure}>

		<input type="hidden" name="id" value={storageLocationId} />
		<div class="form-row">
			<input type="text" name="name" placeholder="Name" required bind:value={values.name}/>
			<div class="display-wrapper">
				<span>Type</span>
				<span>{sLT.titleById(values.type)}</span>
			</div>			
		</div>
		<input type="text" name="details" placeholder="Details" bind:value={values.details}/> 
		<div class="select-wrapper">

			<Select options={optionsAddress} name="address_id" placeholder="Address" bind:value={values.addressId}/>

			<Button modal="address-add" data={{values, company, companyId}} role="link" inverse>Add Address</Button>

			<span style="display:contents"></span>
		</div>
		<fieldset name="preferred">
			<legend></legend>
			<div>
				<input type="checkbox" id="preferred" name="preferred" bind:checked={values.preferred}/>
				<label for="preferred">Preferred</label>
			</div>
		</fieldset>
		
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

	.select-wrapper
		width: 100%
		@include flex-col-left(.25rem)

</style>