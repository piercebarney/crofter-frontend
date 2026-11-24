<script lang="ts">

	import { PUBLIC_ENV } from '$env/static/public'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import { routes } from 'src/lists/routes'
	import { user } from 'src/stores/user'
   


	if (browser && (PUBLIC_ENV != 'local' && (!$user.role || !$user.role.includes('admin')))) goto(routes.consumerDefaultPathname)

</script>



<div class="pico-scope" style="display:contents">

	<slot />

</div>