<script lang="ts"></script>



<div>
	
	<slot name="details" />

</div>
<ul>
	
	<slot name="options" />

</ul>



<style lang="sass">

	div :global(span)
		display: block

	div :global(span:first-child)
		margin-bottom: .5rem
		font-size: 3rem
		font-weight: 600

	div :global(span:nth-child(2))
		font-size: 1.5rem

	ul
		width: 100%
		margin: -2rem 0 0
		padding: 1rem 0

	ul :global(li)
		margin: 0
		list-style-type: none
		text-align: left
		cursor: pointer
		border-bottom: 1px solid black
		@include flex-row-left(.75rem)

	ul :global(button),
	ul :global(a)
		width: 100%
		padding: 2rem 1rem
		font-size: 1.5rem

		&:hover
			color: var(--cm-primary-hover)

</style>