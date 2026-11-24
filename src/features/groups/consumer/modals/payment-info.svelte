<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Manager from 'src/features/groups/consumer/modals/payment-info/manager.svelte'



	export let modal: any

</script>



<Container label="Payment Info" {modal}>

	<Manager {modal} />
	
</Container>