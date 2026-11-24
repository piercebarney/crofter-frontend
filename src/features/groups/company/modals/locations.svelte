<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Manager from 'src/features/groups/company/modals/loactions/manager.svelte'



	export let modal: any

</script>



<Container label="Locations and Hours" {modal}>

	<Manager {modal} />
	
</Container>