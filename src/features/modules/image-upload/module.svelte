<script lang="ts">

	import { imageUpload } from 'src/features/modules/image-upload/store'



	let inputElement: HTMLInputElement

	$: if (inputElement) imageUpload.set({input:inputElement})

</script>



<div id="image-upload">
	<input type="file" accept=".jpg, .jpeg, .png" bind:this={inputElement} on:change={imageUpload.process} style="display:none" />
</div>



<style lang="sass">

	#image-upload
		display: none

</style>