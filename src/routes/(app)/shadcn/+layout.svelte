<script lang="ts">

	import { ModeWatcher } from "mode-watcher";

	const { children } = $props();

</script>



<ModeWatcher />

<div class="tailwind-scope">

	{@render children?.()}

</div>