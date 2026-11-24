<script lang="ts">

	import { textToHtml } from 'src/lib/helpers'


	
	export let text: string

	$: scrubbedText = textToHtml(text)

</script>



<div class="rte">{@html scrubbedText}</div>



<style lang="sass">

	div.rte
		display: block !important
		line-height: 1.4 !important
		font-weight: 200 !important
		word-wrap: break-word !important

	:global(div.rte > *)
		font-weight: 200 !important
		word-wrap: break-word !important

	:global(div.rte p)
		display: block !important
		margin-block-start: 1em !important
		margin-block-end: 1em !important
		margin-inline-start: 0px !important
		margin-inline-end: 0px !important

	:global(div.rte ul)
		display: block !important
		list-style-type: disc !important
		margin-block-start: 1em !important
		margin-block-end: 1em !important
		margin-inline-start: 0px !important
		margin-inline-end: 0px !important
		padding-inline-start: 40px !important

	:global(div.rte ul li)
		list-style-type: disc !important
	
	:global(div.rte ol)
		display: block !important
		list-style-type: decimal !important
		margin-block-start: 1em !important
		margin-block-end: 1em !important
		margin-inline-start: 0px !important
		margin-inline-end: 0px !important
		padding-inline-start: 40px !important

	:global(div.rte li)
		margin: 0 !important

	:global(div.rte > *:first-child)
		margin-block-start: 0 !important

	:global(div.rte > *:last-child)
		margin-block-end: 0 !important

	:global(div.rte a)
		color: #195140 !important
		
		&:hover
			text-decoration: underline !important

</style>