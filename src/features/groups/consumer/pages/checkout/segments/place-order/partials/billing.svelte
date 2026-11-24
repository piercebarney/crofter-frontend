<script lang="ts">

	import { user as u } from 'src/stores/user'
	import Addresses from 'src/features/partials/addresses.svelte'
	import Button from 'src/components/elements/button.svelte'


	
	export let addressId: string|null
	export let validAddress: boolean

</script>



<div class="address-wrapper">

	{#if !$u.firstName || !$u.lastName}

		<Button modal="profile-update" thin>Add Name</Button>

	{:else if !$u.phoneNumber}

		<Button modal="profile-update" thin>Add Phone Number</Button>

	{:else}
	
		<span><b>{u.fullName()}</b></span>

		<Addresses bind:selection={addressId} bind:valid={validAddress} single />

	{/if}
	
</div>



<style lang="sass">

	.address-wrapper
		@include flex-col(1rem)

</style>