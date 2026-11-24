<script lang="ts">

	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'

	const action = () => layout.set({overlay:$layout.overlay != 'nav' ? 'nav' : null})

</script>



<Button {action} c="nav-button-wrapper" wrapper>

	<Icon name="hamburger" size="2rem" />

</Button>