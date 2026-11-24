<script lang="ts">

	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'
	import PickUpLocation from 'src/features/groups/consumer/pages/checkout/partials/pick-up-loaction.svelte'



	export let modal: any

	const action = (locationId:string) => {

		c.setPreferences({pickUpLocationId:locationId})

		modal.close()
	}

	$: locations = $pL && pL.getByActive()

</script>



<Container label="Pick Up Locations" {modal}>

	<div class="wrapper">

		{#each locations as location (location)}

			<Button action={() => action(location.id)} wrapper>

				<PickUpLocation {location} button />

			</Button>

		{/each}

		<span style="display:contents"></span>
	</div>
	
</Container>



<style lang="sass">

	.wrapper
		@include flex-col

</style>