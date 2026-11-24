<script lang="ts">

	import { browser } from '$app/environment'
	import { apiV2 } from 'src/lib/apiV2'



	let products: any = null
	let page: number = 0

	const getPickupLocations = async () => {

		// const { pickupLocations } = await apiV2.pickupLocations()

		// console.log({pickupLocations})
	}

	const getPickupLocation = async () => {

		const { pickupLocation } = await apiV2.pickupLocation({id:'019853b1-f474-751d-8c6a-40a113ec07ac'})

		console.log({pickupLocation})
	}

	const setPickupLocation = async () => {

		const { pickupLocation, error } = await apiV2.pickupLocation({
			set : {
				addressId	: '01983eaa-caaa-7bc6-8137-98cc0f426720',
				companyId	: 'd156627b-e6ea-48df-9753-8bb106003ed3',
				name		: 'Salem',
				openHours	: '{}'
			}
		})

		console.log({pickupLocation, error})
	}

	const updatePickupLocation = async () => {

		const { pickupLocation, error } = await apiV2.pickupLocation({
			id	: '019853b1-f474-751d-8c6a-40a113ec07ac',
			set	: {
				name		: 'Spanish Fork',
				openHours	: '{}'
			}
		})

		console.log({pickupLocation, error})
	}

	const getStockItem = async () => {

		const { stockItem } = await apiV2.stockItem({id:'0198772c-622c-77c2-8e28-13d192af93c9'})

		console.log({stockItem})
	}

	const getProducts = async () => browser && ({ products } = await apiV2.products({
		filter	: {forDistribution:true},
		get		: 'title,description',
		limit	: 5,
		page	: page
	}))

	const getMe = async () => {

		const { user } = await apiV2.me()

		console.log({user})
	}

	$: page, (() => {
		
		if (page < 0) page = 0
		
		getProducts()
	
	})()

	$: console.log(products)

</script>



<div class="container">
	<!-- <button on:click={getProducts}>Get Products</button> -->
	<button on:click={getPickupLocations}>Get Pickup Locations</button>
	<button on:click={getPickupLocation}>Get Pickup Location</button>
	<button on:click={setPickupLocation}>Set Pickup Location</button>
	<button on:click={updatePickupLocation}>Update Pickup Location</button>
	<button on:click={getStockItem}>Get Stock Item</button>
	<button on:click={getMe}>Get Me</button>

	<div class="products">
		<div class="content">

			{#each products as product (product)}

				<span>{product.title}</span>

			{/each}

		</div>
		<div class="pagination">
			<button on:click={() => page--} disabled={page === 0}>&lt;</button>
			<input type="number" min="0" bind:value={page} />
			<button on:click={() => page++}>&gt;</button>
		</div>
	</div>
</div>



<style lang="sass">

	.container
		padding-top: 2rem
		@include fill
		@include flex-col-top-center(1rem)

	button
		width: 4rem !important

	.products
		width: 100%
		@include flex-col-top-center(1rem)

		.content
			@include fill
			@include flex-col-top-left(1rem)

			span
				width: 100%
				border: 1px solid #ccc
				border-radius: 4px
				padding: 1rem

		.pagination
			@include flex-row-middle-center(1rem)

			button
				width: 2rem

			input
				width: 4rem
				text-align: center

				// Remove spinner buttons from number input
				&::-webkit-outer-spin-button,
				&::-webkit-inner-spin-button
					-webkit-appearance: none
					margin: 0

				&[type=number]
					-moz-appearance: textfield

</style>