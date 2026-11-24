<script lang="ts">

	import Button from 'src/features/groups/company/partials/filter/button.svelte'
	import Menu from 'src/features/groups/company/partials/filter/menu.svelte'



	export let filterFulfillmentMethod:	string
	export let filterOrderStatus:		string

</script>



<Button {filterFulfillmentMethod} {filterOrderStatus} />

<Menu bind:filterFulfillmentMethod={filterFulfillmentMethod} bind:filterOrderStatus={filterOrderStatus} />