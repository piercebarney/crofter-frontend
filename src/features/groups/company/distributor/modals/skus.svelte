<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	const company	= $modal.data.company
	// const deleteAlert	= {
	// 	type	: 'danger',
	// 	message	: "You are about to delete a stock item."	
	// }

	let skus: any[] = []

	$: $company.skus, (skus = $company.skus.sort((a:any, b:any) => a.code.localeCompare(b.code)))

</script>



<Container label="SKUs" {modal}>

	<div class="add-button">
		<div>

			<Button modal="sku-add" data={{company}} thin>Add</Button>

		</div>
	</div>

	{#if skus}

		<div class="list">

			{#each skus as sku (sku)}

				{@const fulfillment = [sku.canDeliver && 'Delivery', sku.canPickUp && 'PickUp'].filter(Boolean).join(', ')}
				{@const variantOption = company.variantOptionById(sku.variantId)}

				<div class="list-item">
					<div class="details">
						<div class="title">
							<div>
								<span>{sku.code}</span>
								<span>({fulfillment || 'None'})</span>

								{#if !sku.active}

									<span>- Inactive</span>

								{/if}

								{#if sku.displayOrder}
							
									<span>- {sku.displayOrder}</span>
								
								{/if}

							</div>
							<span class="variant">{variantOption.option}</span>
						</div>
					</div>
					<div class="buttons">

						<Button modal="sku-update" data={{company, sku}} mini>Edit</Button>

						<!-- <Button action={() => company.removeSku(sku.id)} modalAlert={deleteAlert} mini>Delete</Button> -->

					</div>
				</div>

			{/each}

		</div>

	{:else}

		<div class="empty">

			There are no SKUs for this company.

		</div>

	{/if}
	
</Container>



<style lang="sass">

	.add-button
		
		> div
			float: right
			width: fit-content

	.list-item
		flex-wrap: nowrap
		border-bottom: 1px solid var(--cm-border)
		padding: 1rem 0
		@include flex-col(1rem)

		&:last-child
			border-bottom: none

		.details
			@include flex-col-left(.5rem)

			.title

				> div
					@include flex-row-middle-left(.5rem)

					span:first-child
						font-size: 1.5rem
						font-weight: 600

				.variant
					display: block
					margin-top: .25rem
					font-size: .8rem
					color: var(--cm-text-secondary)
					font-style: italic
					word-wrap: break-word

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