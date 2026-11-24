<script lang="ts">

	import { header } from 'src/features/modules/header/store'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'

	let href:	string|undefined	= undefined,
		route:	string|undefined	= undefined

	$: if ($header.backButton) {

		route = $header.backButton.route

		if (!route) href = $header.backButton.href
	}

</script>



<A {href} {route} wrapper>
	
	<Icon name="chevronLeft" size="2rem" />

</A>