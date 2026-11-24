<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company		= $modal.data.company
	const deleteAlert	= {
		type	: 'danger',
		message	: "You are about to delete a storage location."	
	}

	let storageLocations: any[] = []

	$: $company.storageLocations, (storageLocations = $company.storageLocations.sort((a:any, b:any) => a.name.localeCompare(b.name)))

</script>



<Container label="Storage Locations" {modal}>

	<div class="add-button">
		<div>

			<Button modal="storage-location-add" data={{company}} thin>Add</Button>

		</div>
	</div>

	{#if storageLocations}

		<div class="list">

			{#each storageLocations as storageLocation (storageLocation)}

				<div class="list-item">
					<div class="details">
						<div class="title">
							<span>{storageLocation.name}</span>
							<span>({storageLocation.type})</span>

							{#if storageLocation.preferred}

								<span class="preferred"> - Preferred</span>
								
							{/if}

						</div>
					</div>
					<div class="buttons">

						<Button modal="storage-location-update" data={{company, storageLocation}} mini>Edit</Button>

						<Button action={() => company.removeStorageLocation(storageLocation.id)} modalAlert={deleteAlert} mini>Delete</Button>

					</div>
				</div>

			{/each}

		</div>

	{:else}

		<div class="empty">

			There are no storage locations for this company.

		</div>

	{/if}
	
</Container>



<style lang="sass">

	.add-button
		
		> div
			float: right
			width: fit-content

	.list-item
		flex-wrap: wrap
		border-bottom: 1px solid var(--cm-border)
		padding: 1rem 0
		@include flex-col(1rem)

		&:last-child
			border-bottom: none

		.details
			@include flex-col-left(.5rem)

			.title
				@include flex-row-middle-center(.5rem)

				span:first-child
					font-size: 1.5rem
					font-weight: 600

		.buttons
			width: fit-content
			@include flex-row-middle-center(.5rem)
			

	.empty
		margin-top: 3rem
		text-align: center
		font-size: 1.5rem


	@media (min-width: #{breakpoint('sm')})

		.list-item
			@include flex-row-middle-between(1rem)

</style>