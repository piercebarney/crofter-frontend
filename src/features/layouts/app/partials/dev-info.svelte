<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { account } from 'src/features/pages/account/store'



	const min = 288

	$: layoutWidth		= $layout.width
	$: layoutSize		= $layout.size
	$: scrollPosition	= $layout.scroll.position
	$: device			= {mobile:'mbl', tablet:'tbl', desktop:'dsk'}[$layout.device as 'mobile'|'tablet'|'desktop']
	$: danger			= layoutWidth < min
	$: activeType		= $account.active.type
	$: activeId			= $account.active.id || 'none'

</script>



{#if layoutWidth > 0}

	<div class="dev-info-wrapper">
		<div class:danger>
			<div><span>min:</span><span>{min}</span></div>
			
			{#each Object.keys($layout.sizes) as size (size)}
				<div><span>{size}:</span><span>{$layout.sizes[size]}</span></div>
			{/each}

			<div class="bar"></div>

			<div><span>mbl:</span><span>&lt;&nbsp;{$layout.mobile}</span></div>
			<div><span>tbl:</span><span>&#61;&nbsp;{$layout.tablet}</span></div>
			<div><span>dsk:</span><span>&#62;&nbsp;{$layout.desktop}</span></div>

			<div class="bar"></div>

			<div><span>id:</span><span class="id">{activeId}</span></div>

		</div>
		<div class:danger>{#if scrollPosition}s:{scrollPosition}&nbsp;•&nbsp;{/if}{layoutSize}&nbsp;•&nbsp;w:{layoutWidth}&nbsp;•&nbsp;{device}&nbsp;•&nbsp;{activeType.charAt(0).toUpperCase()}</div>
	</div>

{/if}



<style lang="sass">

	.dev-info-wrapper
		z-index: 999999
		position: relative
		cursor: help

		> div
			height: 22px
			border-top: 1px solid
			border-left: 1px solid
			border-radius: 6px 0 0 0
			padding: 4px 6px
			font-size: 12px

		> div:first-child
			z-index: 10001
			height: 0
			width: 112px
			overflow: hidden
			border-color: #000
			background-color: #fff
			transition: height .2s ease-in-out
			@include flex-col-top(4px)
			@include absolute-bottom-right

			> div
				@include flex-row-between
				
				&.bar
					border-bottom: 1px solid #000

			.id
				text-align: right

			&.danger
				left: 0 !important
				right: auto !important
				border-left: 0
				border-right: 1px solid
				border-radius: 0 6px 0 0

		> div:last-child
			z-index: 10002
			min-width: 77px
			border-color: #fff
			background-color: #000
			text-align: center
			color: #fff
			@include absolute-bottom-right

			&.danger
				background-color: #f00
				width: 100%
				border-radius: 0
				text-align: left

		&:hover > div:first-child
			height: 266px

</style>