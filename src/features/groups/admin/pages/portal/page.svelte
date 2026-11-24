<script lang="ts">

	import type { Sections, Objects } from 'src/features/groups/admin/pages/portal/types'

	import UserUnit from 'src/features/groups/admin/pages/portal/units/user/unit.svelte'
	import CompanyUnit from 'src/features/groups/admin/pages/portal/units/company/unit.svelte'
	import ProductUnit from 'src/features/groups/admin/pages/portal/units/product/unit.svelte'



	const sections:	Sections	= { company:null, product:null, user:null }
	const objects:	Objects		= { company:null, product:null, user:null }

</script>



<div id="admin-portal">
	<header>
		<div class="container">	
			<div>
				<span>ADMIN PORTAL</span>
			</div>
			<div>
				<a href="/">Home</a>
				<a href="/logout">Logout</a>
			</div>
		</div>
	</header>
	<main>
		<div class="container">
			
			<UserUnit key="user" title="User" {sections} {objects} />

			<CompanyUnit key="company" title="Company" {sections} {objects} />

			<ProductUnit key="product" title="Product" {sections} {objects} />

			<span style="display:contents"></span>
		</div>
	</main>
</div>



<style lang="sass">

	:root
		--c-admin-primary: #017FC0
		--c-admin-danger: #D93526


	:global(#admin-portal a),
	:global(#admin-portal [role="link"])
		color: inherit
		
		&:hover
			color: var(--c-admin-primary)

		&:is(:active, :focus)
			color: inherit

			&:hover
				color: var(--c-admin-primary)

	:global(#admin-portal .card-wrapper a),
	:global(#admin-portal .card-wrapper [role="link"])
		color: var(--c-admin-primary)
		
		&:hover
			text-decoration: underline

		&:is(:active, :focus)
			color: var(--c-admin-primary)

			&:hover
				text-decoration: underline

	:global(#admin-portal [role="link"].active)
		text-decoration: underline

	:global(#admin-portal button)

		&:not([role="link"])
			height: 2.5rem
			min-height: 2.5rem
			width: max-content
			min-width: max-content
			padding: 0 1rem
			border: 1px solid var(--c-admin-primary)
			border-radius: .5rem
			background-color: var(--c-admin-primary)
			color: white
			font-size: 1rem

			&:hover
				background-color: white
				color: var(--c-admin-primary)

	:global(#admin-portal button.danger)

		&:not([role="link"])
			border-color: var(--c-admin-danger)
			background-color: var(--c-admin-danger)

			&:hover
				background-color: white
				color: var(--c-admin-danger)

	:global(#admin-portal input),
	:global(#admin-portal select)
		padding: 1rem
		border: 1px solid #ddd
		border-radius: .5rem

		&:not([type="checkbox"])
			height: 2.5rem
			min-height: 2.5rem

		&:is(:active, :focus)
			border-color: var(--c-admin-primary)

	:global(#admin-portal select)
		padding: 0 1rem

	:global(#admin-portal .message.info)
		color: var(--c-admin-primary)

	:global(#admin-portal .message.error)
		color: var(--c-admin-danger)

	#admin-portal
		position: relative
		height: 100%

		header
			z-index: 10
			position: fixed
			top: 0
			width: 100%
			padding: 1rem 0
			background-color: black
			font-size: 1.5rem

			div
				color: white
				@include flex-row-middle-between(1rem)

		main
			overflow: auto
			height: 100%
			padding: 5rem 0
			background-color: #eee

			> div
				@include flex-col(2rem)


	@media (min-width: #{breakpoint('md')})

		#admin-portal

			main

				> div
					gap: 4rem

</style>