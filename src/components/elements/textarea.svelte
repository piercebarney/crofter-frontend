<script lang="ts">

	import { onMount } from 'svelte'
	import { textToHtml } from 'src/lib/helpers'



	export let name:		string|undefined	= undefined
	export let rows:		number				= 12
	export let maxlength:	number				= 2000
	export let placeholder:	string|undefined	= undefined
	export let value:		string				= ''
	export let required:	any					= undefined
	export let rte:			boolean				= false
	export let application:	boolean				= false
	
	let targetElement:		HTMLElement,
		rteElement:			HTMLTextAreaElement,
		rteValue:	 		string					= '',
		rteLoad: 			boolean					= true,
		tinyMCE:			any						= null

	const loadModule = async () => {
		
		const module = await import('tinymce')
		
		await import('tinymce/themes/silver')
		await import('tinymce/models/dom/model.js')
		await import('tinymce/plugins/lists/plugin.js')
		await import('tinymce/icons/default/icons.js')

		tinyMCE = module.default
	}

	onMount(() => loadModule())

	if (rte && value) rteValue = textToHtml(value)

	$: if (rte && tinyMCE && (value ? value && rteValue : true) && targetElement && rteElement && rteLoad) {

		rteLoad = false

		tinyMCE.baseURL = '/node_modules/tinymce'
		tinyMCE.init({
			target					: targetElement,
			placeholder,
			skin_url				: `/css/tinymce/skins/ui/${application ? 'application' : 'crofter'}`,
			content_css				: '/css/tinymce/skins/content/crofter/content.css',
			height					: (rows * 20) + 83,
			menubar					: false,
			statusbar				: false,
			plugins					: 'lists link',
			toolbar					: 'undo redo | bold italic underline | bullist numlist | link',
			content_style			: 'body { background: #ffffff; padding-bottom: 2px }',
			powerpaste_word_import	: 'clean',
			powerpaste_html_import	: 'clean',
			extended_valid_elements	: 'a[href|target=_blank|rel=noopener noreferrer]',
			default_link_target		: '_blank',
			link_target_list		: [
										{ title: 'New window', value: '_blank' }
									],
			setup					: (editor:any) => {

										editor.on('load', () => {
											
											const element = editor.getContainer()

											if (element) {

												element.style.border = '0.0625rem solid #F4F4F4'
												element.style.transition = 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'

												if (application) element.style.borderRadius = '0.5rem'
											}
										})

										editor.on('focus', () => {

											const element = editor.getContainer()

												if (element) {
													
													if (application)	element.style.borderColor = '#468047'
													else				element.style.borderColor = '#195140'
												}
										})

										editor.on('blur', () => {
											
											const element = editor.getContainer()
											
											if (element) element.style.borderColor = '#F4F4F4'
										})

										editor.on('keyup', () => {

											const event = new Event('keyup', { bubbles: true })
											
											rteElement.dispatchEvent(event)

											rteValue = tinyMCE?.activeEditor ? tinyMCE.activeEditor.getContent() : ''
										})

										editor.on('change', () => {

											const event = new Event('change')

											rteElement.dispatchEvent(event)
										})
									}
		})
	}

	$: count	= value?.length ? value.length : 0
	$: rteCount	= rteValue?.length ? rteValue.length : 0
	
</script>



{#if rte}

	{#if (value ? value && rteValue : true)}

		<div>
			<textarea bind:this={targetElement} value={rteValue}></textarea>
			<textarea {name} bind:this={rteElement} value={rteValue} aria-hidden="true" style="display:none"></textarea>
			<span class:limit={rteCount > maxlength}>{rteCount}/{maxlength}</span>
		</div>

	{/if}

{:else}

	<div>
		<textarea {name} {rows} {maxlength} {placeholder} bind:value {required}></textarea>
		<span class:limit={count > maxlength}>{count}/{maxlength}</span>
	</div>

{/if}



<style lang="sass">

	div
		position: relative
		width: 100%

		textarea
			resize: none
			padding-bottom: 1.7rem

		span
			position: absolute
			right: 11px
			bottom: 13px
			padding: .2rem .4rem
			border-radius: 1rem
			border: 1px solid var(--cm-border)
			background-color: var(--cm-background)
			font-size: .6rem

			&.limit
				border-color: var(--cm-danger)
				color: var(--cm-danger)

	:global(.mce-container)
		border: 0px !important

</style>