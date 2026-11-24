<script lang="ts">

	import type { ActionData, PageData } from './$types'
	import { onMount } from 'svelte'
	import Login from 'src/features/groups/auth/pages/login/page.svelte'



	export let form: ActionData
	export let data: PageData
	
	// If auth was successful, force a full page reload to ensure user data is loaded
	onMount(() => {
		
		if (data?.authSuccess) window.location.href = '/'
	})

</script>



<Login variables={form?.variables} error={form?.error || data?.error} />