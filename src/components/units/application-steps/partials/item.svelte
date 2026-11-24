<script lang="ts">

	import Icon from 'src/components/elements/icon/element.svelte'



	export let icon:	string
	export let title:	string
	export let active:	boolean	= false
	export let link:	boolean	= false

</script>



<div class="wrapper{active ? ' active' : ''}{link ? ' link' : ''}">
	<div class="icon">
		<div>

			<Icon name={icon} size="1.5rem" />

		</div>
	</div>
	<div class="text">
		<div class="title">
			<span>{title}</span>
		</div>
		<div class="body">
		
			<slot />

		</div>
	</div>
</div>



<style lang="sass">

	.wrapper
		padding: 0 1rem 1rem 0
		border-radius: var(--pico-border-radius)
		@include flex-row-top
		// @include border(blue, 1px)

		.icon
			flex-grow: 0
			padding: 1rem

			> div
				stroke: var(--cm-text)

		.text
			@include flex-col-left(.5rem) // @include flex-col-left

			.title
				width: 100%
				padding-top: 1rem // padding: 1rem 0

				span
					font-size: 1.5rem
					font-weight: 600

			.body
				font-size: 1.15rem
				line-height: 1.2
				color: var(--cm-text-secondary)

		&.active
			background-color: #EDE6DE
			transition: background-color var(--pico-transition)

		&.link:hover:not(.active)

			.text

				.title
					
					span
						font-weight: 800
						transition: font-weight var(--pico-transition)


	@media (min-width: #{breakpoint('md')})

		.wrapper
			padding: 0 1rem 1rem 0

			.icon
				padding: 1rem 1.5rem 1rem 1rem

			// .text

			// 	.title
			// 		padding: 1rem 0

				// 	span
				// 		font-size: 1.5rem

				// .body
				// 	font-size: 1.25rem


	@media (min-width: #{breakpoint('lg')})

		.wrapper
			padding: 0 1.5rem 1rem 0

			.icon
				padding: 1rem 1.5rem

			// .text

			// 	.title

			// 		span
			// 			font-size: 1.5rem

			// 	.body
			// 		font-size: 1.15rem


	@media (min-width: #{breakpoint('xl')})

		.wrapper

			.text

				.title

					span
						font-size: 1.5rem

				.body
					font-size: 1.25rem

</style>