<script lang="ts">

	import type { ActionData } from './$types'
	
	import SignUp from 'src/features/groups/auth/pages/sign-up/page.svelte'


	
	export let form: ActionData

</script>



<SignUp variables={form?.variables} error={form?.error} />