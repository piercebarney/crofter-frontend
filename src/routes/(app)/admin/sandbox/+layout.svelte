<script lang="ts">
	import { PUBLIC_ENV } from '$env/static/public'
	import { goto } from '$app/navigation'
	import { routes } from 'src/lists/routes'
	
	

	if (PUBLIC_ENV != 'local') goto(routes.consumerDefaultPathname)

</script>

<slot />