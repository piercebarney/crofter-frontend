<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company		= $modal.data.company
	const deleteAlert	= {
		type	: 'danger',
		message	: "You are about to delete a stock item."	
	}

	let stockItems: any[] = []

	$: $company.stockItems, (stockItems = company.getStockItemsWithStorageLocationAndSkuNames())

</script>



<Container label="Stock Items" {modal}>

	<div class="add-button">
		<div>

			<Button modal="stock-item-add" data={{company}} thin>Add</Button>

		</div>
	</div>

	{#if stockItems}

		<div class="list">

			{#each stockItems as stockItem (stockItem)}

				<div class="list-item">
					<div class="details">
						<div class="title">
							<span>{stockItem.storageLocation.name}</span>
							<span>({stockItem.sku.code})</span>
						</div>
					</div>
					<div class="buttons">

						<Button modal="stock-item-update" data={{company, stockItem}} mini>Edit</Button>

						<Button action={() => company.removeStockItem(stockItem.id)} modalAlert={deleteAlert} mini>Delete</Button>

					</div>
				</div>

			{/each}

		</div>

	{:else}

		<div class="empty">

			There are no stock items for this company.

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