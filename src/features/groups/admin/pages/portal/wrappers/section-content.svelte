<script lang="ts">

	import type { Keys } from 'src/features/groups/admin/pages/portal/types'

	import Message from 'src/features/groups/admin/pages/portal/units/message.svelte'



	export let section:	Keys
	export let name:	string
	export let active:	boolean

</script>



<div class="content {name} {active ? 'active' : ''}">
	<div class="controls">

		<slot name="controls" />

		<slot name="count"></slot>

		<span style="display:contents"></span>
	</div>
	<div class="data">

		<slot />

		<span style="display:contents"></span>
	</div>

	<Message id={`${section}-${name}`} />

</div>



<style lang="sass">

	.content
		display: none
		background-color: white
		border-radius: .5rem
		border: 1px solid #ddd
		box-shadow: .25rem .25rem .25rem rgba(0,0,0,.1)

		&.active
			display: block

		.controls
			padding: .5rem
			@include flex-row-top-between(.5rem)

		.data
			overflow: hidden
			max-height: 42rem
			@include flex-col


	@media (min-width: #{breakpoint('md')})

		.content

			.controls
				padding: 1rem
				@include flex-row-middle-between(1rem)

			.data
				gap: 1rem

</style>