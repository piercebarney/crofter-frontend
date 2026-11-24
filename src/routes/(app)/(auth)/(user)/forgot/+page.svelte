<script lang="ts">

	import type { ActionData } from './$types'

	import Forgot from 'src/features/groups/auth/pages/forgot/page.svelte'


	
	export let form: ActionData

</script>



<Forgot variables={form?.variables} error={form?.error} />