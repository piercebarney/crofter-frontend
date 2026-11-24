<script lang="ts">

	import type { User } from 'src/types/user'

	import Account from 'src/features/groups/auth/pages/register/partials/account.svelte'
	import Modal from 'src/features/modules/modal/module.svelte'


	
	export let user: User

</script>



<div class="wrapper">

	<Account newUser={!user.id} />

</div>

<Modal />



<style lang="sass">

	.wrapper
		@include fill

</style>