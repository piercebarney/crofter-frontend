<script lang="ts">

	import { user as u } from 'src/stores/user'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Addresses from 'src/features/partials/addresses.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let addressId: string|null
	export let validAddress: boolean

</script>



<div class="address-wrapper">
	<div class="note">
		<div>

			<Icon name="truck" size="2rem" />

		</div>
		<div>
			<span>Available only in Salt Lake County and Utah County.</span>
			<span>Order by 8 p.m. for delivery the next morning (5-8 a.m.). Orders after 8 p.m. deliver the following morning. No deliveries on Sundays.</span>
			<span>Please see our fulfillment policy below for more details.</span>
		</div>
	</div>
	
	{#if $u.firstName && $u.lastName}
	
		<span><b>{u.fullName()}</b></span>

		<Addresses bind:selection={addressId} bind:valid={validAddress} single showDeliveryInstructions />
	
	{:else}

		<Button modal="profile-update" thin>Add Name</Button>

	{/if}
	
</div>



<style lang="sass">

	.address-wrapper
		@include flex-col(1rem)

		.note
			background-color: var(--cm-background-secondary)
			border-radius: var(--pico-border-radius)
			padding: 1rem
			@include flex-row-middle-left(1rem)

			> div
				@include flex-col-left(.25rem)

				span
					display: inline-block
					font-size: .8rem
					line-height: 1.4

				span:first-child
					font-size: 1.2rem

	@media (min-width: #{breakpoint('md')})

		.address-wrapper
			
			.note
				font-size: 1rem

</style>