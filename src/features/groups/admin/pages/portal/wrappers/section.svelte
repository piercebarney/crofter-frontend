<script lang="ts">

	import type { Keys, Sections, TabKeys, MessageOptions } from 'src/features/groups/admin/pages/portal/types'



	export let key: 		Keys
	export let title:		string
	export let sections:	Sections
	export let tabs:		Record<Keys, TabKeys>

	export const tabSelector = (sectionName:Keys, tabName:TabKeys) => {

		const section = sections[sectionName]

		if (tabs[sectionName] != tabName) {

			const tabElements		= section?.querySelectorAll('.tab') as NodeListOf<HTMLSpanElement>
			const contentElements	= section?.querySelectorAll('.content') as NodeListOf<HTMLDivElement>

			tabElements.forEach((tab:HTMLSpanElement) => {

				if	(tab.classList.contains(tabName))	tab.classList.add('active')
				else									tab.classList.remove('active')
			})

			contentElements.forEach((content:HTMLDivElement) => {

				if	(content.classList.contains(tabName))	content.classList.add('active')
				else										content.classList.remove('active')
			})

			tabs[sectionName] = tabName
		}
	}

	export const messageUpdate = (id:string, options:MessageOptions) => {

		const element = document.getElementById(id) as HTMLSpanElement

		if (element) {

			if (options?.message) element.textContent = options.message

			if (options?.type) {

				element.classList.remove('info', 'error')
				element.classList.add(options.type)
			}

			if (options?.display !== undefined) element.style.display = options.display ? 'inline-block' : 'none'
		}
	}

</script>



<section class="section {key}" bind:this={sections[key]}>

	{#if sections[key]}

		<span class="label">{title}</span>
		<div class="body">
			<div class="tabs">

				<slot name="tabs" />

			</div>

			<slot />

		</div>

	{/if}

</section>



<style lang="sass">

	section
		width: 100%

		.label
			display: inline-block
			margin-bottom: 1rem
			font-size: 1.5rem

		.body

			.tabs
				margin-bottom: -1px
				padding: 0 .5rem
				@include flex-row-left


	@media (min-width: #{breakpoint('md')})

		section
			width: 100%

			.label
				font-size: 2rem

			.body

				.tabs
					padding: 0 1rem

</style>