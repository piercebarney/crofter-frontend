<script lang="ts">

	import { PUBLIC_API_URL } from '$env/static/public'
	import { onMount } from 'svelte'
	import { user } from 'src/stores/user'
	import { storage } from 'src/lib/storage'



	onMount(() => {

		user.clear()
		storage.clear()
		
		window.location.href = `${PUBLIC_API_URL}/auth/sign_out?return_url=${encodeURIComponent(window.location.origin)}`
	})

</script>



<span class="title">Logging Out...</span>



<style lang="sass">

	.title
		font-size: 1.5rem
		font-weight: 900
			
</style>