<script lang="ts">

	import type { Product } from 'src/types/product'

	import { api } from 'src/lib/api'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { layout } from 'src/stores/layout'
	import { modal } from 'src/features/modules/modal/store'
	import { header } from 'src/features/modules/header/store'
	// import { account } from 'src/features/pages/account/store'
	import { formatTitle, formatPrice } from 'src/components/helpers'
	import { routes } from 'src/lists/routes'
	import PageHeader from 'src/features/groups/company/partials/page-header.svelte'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Toggle from 'src/components/elements/toggle.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Form from 'src/components/elements/form.svelte'
	import Label from 'src/components/elements/label.svelte'
	import Textarea from 'src/components/elements/textarea.svelte'
	import Tooltip from 'src/components/elements/tooltip/element.svelte'
	import ImageUpload from 'src/components/units/image-upload/unit.svelte'



	export let product: Product
	export let application: boolean	= false

	const productId: string				= product.id
	// const companyId: string|null		= $account.active.id
	// const bypassIds: string[]			= [
	// 	'18e9873a-b4e7-4648-8216-fa93a7b4f59f', // Jane's Farm (dev)
	// 	'eaff6b8c-acfd-4330-acb4-03e62d418cfe', // Bar C Homestead (prod)
	// 	'25ebd292-471d-4fb3-853a-3311cc9c411c' // Mountain Fungus (prod)
	// ]
	// const nonBypassDisabled: boolean	= !bypassIds.includes(companyId || '')

	let formElement: HTMLFormElement,
		// preOrderWrapperElement: HTMLDivElement,
		// inventoryWrapperElement: HTMLDivElement,
		// subscriptionsWrapperElement: HTMLDivElement,
		formSubmit: (()=>boolean),
		buttonReset: (()=>void),
		formChange: boolean				= false,
		active: boolean					= true,
		activeChanged: boolean			= false,
		imageChanged: boolean			= false,
		title: string,
		price: string
		// forPickUp: boolean				= false,
		// forDelivery: boolean			= true,
		// forDistribution: boolean		= false
		// preOrdersEnabled: boolean				= true,
		// maxCapacity: boolean				= false,
		// inventoryEnabled: boolean				= false,
		// subscriptionsEnabled: boolean				= false

	const onDeleteAlert = {
		type	: 'danger',
		message	: "You are about to delete a product. This cannot be undone."	
	}
	
	const onDelete = async () => {

		const { success } = await api.productDelete({ variables:{productId} })
			
		if (success) {
			
			if (application)	goto(routes.pathname('application-products'))
			else				goto(routes.pathname('producer-products'))
		}
	}

	const onSuccess = () => {

		if (application)	goto(routes.pathname('application-products'))
		else				goto(routes.pathname('producer-products'))
	}

	// const open = (element:HTMLDivElement, maxHeight:number) => {

	// 	element.style.maxHeight = `${maxHeight}px`
		
	// 	setTimeout(() => element.style.overflow = 'visible', 1000)
	// }

	// const close = (element:HTMLDivElement) => {

	// 	element.style.maxHeight	= '0'
	// 	element.style.overflow	= 'hidden'
	// }

	$: isMobile	= $layout.isMobile

	$: if (activeChanged || imageChanged) formChange = true

	$: if (title) title = formatTitle(title)

	$: if (product && !title && !price) {

		title			= product.title
		price			= product.price.amount
		active			= product.active
		// forDelivery		= product.forDelivery
		// forPickUp		= product.forPickUp
		// forDistribution	= product.forDistribution
	}

	// $: if	(preOrdersEnabled && preOrderWrapperElement)	open(preOrderWrapperElement, 157)
	// else if (preOrderWrapperElement)						close(preOrderWrapperElement)

	// $: if	(inventoryEnabled && inventoryWrapperElement)	open(inventoryWrapperElement, 16)
	// else if (inventoryWrapperElement)						close(inventoryWrapperElement)

	// $: if	(subscriptionsEnabled && subscriptionsWrapperElement)	open(subscriptionsWrapperElement, 16)
	// else if (subscriptionsWrapperElement)							close(subscriptionsWrapperElement)

	$: if (browser && formChange) modal.set({formChange})

	$: if	(browser && isMobile)	header.set({backButton:{route:'producer-products'}})
	else if	(browser)				header.set({backButton:null})

</script>



{#if isMobile}

	<div class="edit-product-wrapper-mobile">
		<div class="container">
			
			<Form action="/products?/update" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset} {application}>
				
				<div class="data">
					<input type="hidden" name="productId" value={productId} />
					<input type="hidden" name="active" value={active} />
					<input type="hidden" name="imageChanged" value={imageChanged} />
					<div class="inner-wrapper">
						<div>

							<Label margin={false}>Product Info</Label>

							<div class="group">
								<div class="image">
									<div>
										<span>Product Image<Tooltip tip="products:image" placement="bottom" iconSize="1.25rem" /></span>
									
										<ImageUpload {formElement} src={product?.image} bind:changed={imageChanged} {application} />
				
									</div>
								</div>
								<label for="html">
									<span>Product Name</span>
									<input type="text" name="title" placeholder="Product Name" bind:value={title} />
								</label>
								<label for="html">
									<span>Description</span>

									<Textarea name="description" maxlength={3000} placeholder="Description" value={product?.description} rte />

								</label>
								<div class="grid">
									<label for="html">
										<span>Price</span>
										<div class="price-wrapper">
											<input type="text" name="price_amount" placeholder="0.00" bind:value={price} on:change={() => price = formatPrice(price)} />
											<span>$</span>
										</div>
									</label>
									<label for="html">
										<span>Unit<Tooltip tip="products:info:unit" placement="right" iconSize="1.25rem" /></span>
										<input type="text" name="unit" placeholder="Unit" value={product?.unit} />
									</label>
								</div>
								<!-- <fieldset name="fulfillment">
									<legend>Fulfillment Methods</legend>
									<div title={nonBypassDisabled ? 'This method is temporarily unavailable' : undefined}>
										<input type="checkbox" id="pickup" name="forPickUp" checked={forPickUp} disabled={nonBypassDisabled} />
										<label for="pickup">Pickup</label>
									</div>
									<div>
										<input type="checkbox" id="delivery" name="forDelivery" checked={forDelivery} />
										<label for="delivery">Delivery</label>
									</div>
								</fieldset> -->
								<label for="html">
									<span>Lead Time<Tooltip tip="products:preOrders:leadTime" placement="right" iconSize="1.25rem" /></span>

									<Textarea name="availability" rows={1} maxlength={40} placeholder="Lead Time" value={product?.availability} />
								
								</label>
							</div>
						</div>
					</div>
				</div>
			
			</Form>

		</div>
	</div>
	<div class="buttons">
		<div class="container">

			<Toggle bind:data={active} bind:changed={activeChanged} {application}>Product Published</Toggle>

			<div>
			
				<Button action={onDelete} alert={onDeleteAlert} outline danger>Delete</Button>

				<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange} {application}>Save</Button>

				<span style="display:contents"></span>
			</div>
		</div>
	</div>

{:else}

	<PageHeader>

		<div slot="left">

			{#if application}

				<A route="application-products" hoverApplication><Icon name="arrowBack" />All Products</A>

			{:else}

				<A route="producer-products"><Icon name="arrowBack" />All Products</A>

			{/if}

		</div>
		<div slot="right">

			<Toggle bind:data={active} bind:changed={activeChanged} {application}>Product Published</Toggle>

			<div>
			
				<Button action={onDelete} alert={onDeleteAlert} outline danger>Delete</Button>

			</div>
			<div>
			
				<Button {formSubmit} bind:reset={buttonReset} disabled={!formChange} {application}>Save</Button>

			</div>
		</div>
		
	</PageHeader>
	
	<div class="edit-product-wrapper">
		<div class="container">
			
			<Form action="/products?/update" bind:element={formElement} bind:submit={formSubmit} bind:change={formChange} {onSuccess} onFinal={buttonReset} {application}>
					
				<div class="form-input-wrapper">
					<div class="data">
						<input type="hidden" name="productId" value={productId} />
						<input type="hidden" name="active" value={active} />
						<input type="hidden" name="imageChanged" value={imageChanged} />
						<div class="inner-wrapper">
							<div>

								<Label margin={false} small>Product Info</Label>

								<div class="group">
									<label for="html">
										<span>Product Name</span>
										<input type="text" name="title" placeholder="Product Name" bind:value={title} />
									</label>
									<label for="html">
										<span>Description</span>

										<Textarea name="description" maxlength={3000} placeholder="Description" value={product?.description} rte {application} />

									</label>
									<div class="grid">
										<label for="html">
											<span>Price</span>
											<div class="price-wrapper">
												<input type="text" name="price_amount" placeholder="0.00" bind:value={price} on:change={() => price = formatPrice(price)} />
												<span>$</span>
											</div>
										</label>
										<label for="html">
											<span>Unit<Tooltip tip="products:info:unit" placement="right" iconSize="1.25rem" /></span>
											<input type="text" name="unit" placeholder="Unit" value={product?.unit} />
										</label>
									</div>
									<!-- <fieldset name="fulfillment">
										<legend>Fulfillment Methods</legend>
										<div title={nonBypassDisabled ? 'This method is temporarily unavailable' : undefined}>
											<input type="checkbox" id="pickup" name="forPickUp" checked={forPickUp} disabled={nonBypassDisabled} />
											<label for="pickup">Pickup</label>
										</div>
										<div>
											<input type="checkbox" id="delivery" name="forDelivery" checked={forDelivery} />
											<label for="delivery">Delivery</label>
										</div>
										<input type="checkbox" id="self-serve" name="self-serve" bind:checked={selfServe} />
										<label for="self-serve">Self-serve</label>
									</fieldset> -->
									<label for="html">
										<span>Lead Time<Tooltip tip="products:preOrders:leadTime" placement="right" iconSize="1.25rem" /></span>

										<Textarea name="availability" rows={1} maxlength={40} placeholder="Lead Time" value={product?.availability} />
									
									</label>
								</div>
							</div>
							<!-- <div>

								<Label margin={false} small><Toggle name="preorderEnabled" bind:data={preOrdersEnabled}>Pre-orders</Toggle> <Tooltip tip="products:preOrders:toggle" placement="right" iconSize="1.5rem" /></Label>

								<div class="group" bind:this={preOrderWrapperElement}>
									<label for="html">
										<span>Lead Time<Tooltip tip="products:preOrders:leadTime" placement="right" iconSize="1.25rem" /></span>

										<Textarea name="availability" rows={1} maxlength={40} placeholder="Lead Time" required={preOrdersEnabled ? false : false} />
									
									</label>
									<div class="inline-left">
										<div>

											<Toggle bind:data={maxCapacity}>Set Pre-order Limit</Toggle>

											<Tooltip tip="products:preOrders:limit" placement="right" iconSize="1.25rem" />

										</div>
										<label for="html" class="inline-left">
											<span>Pre-order Limit</span>

											{#if maxCapacity}
											
												<input type="number" name="maximum" min="1" max="999" value="1" required />

											{:else}

												<input type="number" name="maximum" min="1" max="999" value="1" disabled />

											{/if}

										</label>
									</div>
								</div>
							</div> -->
							<!-- <div>

								<Label margin={false} small><Toggle bind:data={inventoryEnabled}>Inventory</Toggle> <Tooltip tip="products:inventory:toggle" placement="right" iconSize="1.5rem" /></Label>
								
								<div class="group"  bind:this={inventoryWrapperElement}>

									INVENTORY STUFF

								</div>
							</div> -->
							<!-- <div>

								<Label margin={false} small><Toggle bind:data={subscriptionsEnabled}>Subscription</Toggle> <Tooltip tip="products:subscriptions:toggle" placement="right" iconSize="1.5rem" /></Label>


								<div class="group"  bind:this={subscriptionsWrapperElement}>

									SUBSCRIPTION STUFF

								</div>
							</div> -->
						</div>
					</div>
					<div class="image">
						<div class="inner-wrapper">
							<span>Product Image<Tooltip tip="products:image" placement="bottom" iconSize="1.25rem" /></span>
						
							<ImageUpload {formElement} src={product?.image} bind:changed={imageChanged} {application} />

						</div>
					</div>
				</div>
			
			</Form>

		</div>
	</div>

{/if}



<style lang="sass">

	div[slot="right"]
		@include flex-row-middle(3rem)

	.edit-product-wrapper-mobile
		stroke: var(--cm-text)
		// background: var(--cm-form-background)
		position: relative
		min-height: 100%

		> div
			padding-bottom: 3rem

			.data
				width: 100%

			.image
				width: 100%

	.buttons
		z-index: 10
		position: fixed
		bottom: 0
		left: 0
		right: 0
		padding: 1rem 0
		background-color: white

		> div
			@include flex-col(1rem)

			> div
				flex-grow: 0
				stroke: var(--cm-text)
				@include flex-row-middle(1rem)

	.edit-product-wrapper
		flex: 1
		padding: 2rem 0
		stroke: var(--cm-text)
		// background: var(--cm-form-background)
		@include flex-col


		> div
			flex: 1

			.form-input-wrapper
				width: 100%
				@include flex-row(4rem)

				.data
					flex: 2 1

				.image
					flex: 1 1

					> div
						margin-top: 4.5rem

	.data

		.inner-wrapper
			width: 100%
			margin: 1.5rem 0
			@include flex-col(3rem)
			
			> div
				@include flex-col(1.5rem)

				.group
					transition: max-height 1s
					@include flex-col(1rem)

		.price-wrapper
			position: relative

			input
				padding-left: 1.75rem
			
			span
				@include absolute-middle-left(1rem)

	.image

		> div

			> span
				display: inline-block
				margin-bottom: 1rem

	// .inline-left
	// 	@include flex-row-middle-left(1rem)

	// input[type=number]
	// 	width: 78px
	// 	padding-right: calc(1rem - 10px)
	// 	text-align: center

	label

		> span
			display: inline-block
			margin-bottom: .75rem
			min-height: 20px
			@include flex-row-middle-left(.25rem)

		// &.inline-left

		// 	> span
		// 		margin-bottom: 0

	// fieldset

	// 	> legend
	// 		display: inline-block
	// 		margin-bottom: .75rem
	// 		min-height: 20px
	// 		@include flex-row-middle-left(.25rem)

	// 	> div
	// 		display: inline-block

	// 		&:not(:last-child)
	// 			margin-inline-end: 1rem

	// 	input:disabled

	// 		+ label
	// 			color: var(--cm-text-secondary)
	// 			cursor: default
			

		// &.inline-left

		// 	> span
		// 		margin-bottom: 0


	@media (min-width: #{breakpoint('sm')})

		.edit-product-wrapper-mobile

			> div
				padding-bottom: 5.5rem

		.buttons
			padding: 1rem 0
			background-color: white

			> div
				@include flex-row-middle-between

				> div
					flex-grow: 0
					stroke: var(--cm-text)
					@include flex-row-middle(3rem)


	@media (min-width: #{breakpoint('xl')})

		.edit-product-wrapper

			> div
				max-width: 950px

</style>