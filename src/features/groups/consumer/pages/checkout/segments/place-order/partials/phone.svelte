<script lang="ts">

	import { user as u } from 'src/stores/user'
	import { formatPhone } from 'src/lib/helpers'
	import Button from 'src/components/elements/button.svelte'

</script>



<div class="phone-wrapper">

	{#if $u.phoneNumber}
	
		<span>{formatPhone($u.phoneNumber)}</span>

		<Button modal="profile-update" c="inverse" role="link">Edit</Button>

	{:else}

		<Button modal="profile-update" thin>Add Phone Number</Button>

	{/if}

</div>



<style lang="sass">

	.phone-wrapper
		@include flex-row

</style>