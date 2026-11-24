<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company			= $modal.data.company
	const companyId			= $company.id
	const optionsAddress	= [...$company.addresses.map((a:any) => ({value:a.id, option:a.address1 + ', ' + a.city + ', ' + a.state})), {value:'', option:'None'}]
	const values			= $modal.values ?? {name:'', type:'', details:'', address_id:''}

	let formElement: HTMLFormElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= $modal.values ? true : false

	const onSuccess = (data:any) => {

		company.addStorageLocation(data)
		
		modal.close()
	}

	const onFailure = () => buttonReset()

	$: if (formElement) { modal.formAlert(formElement).then(modal.close) }

</script>



<Container label="Add Storage Location" closeButtonText="Cancel" {modal}>

	<Form action="/d/stock?/storageLocationAdd" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} {onFailure}>

		<input type="hidden" name="company_id" value={companyId} />
		<div class="form-row">
			<input type="text" name="name" placeholder="Name" required bind:value={values.name}/>

			<Select list="storage-location-types" name="type" placeholder="Type" required bind:value={values.type}/>

		</div>
		<input type="text" name="details" placeholder="Details" bind:value={values.details}/> 
		<div class="select-wrapper">

			<Select options={optionsAddress} name="address_id" placeholder="Address" bind:value={values.address_id}/>

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

	.select-wrapper
		width: 100%
		@include flex-col-left(.25rem)

</style>