<script lang="ts">

	import Icon from 'src/components/elements/icon/element.svelte'

</script>



<div class="offline-overlay">
	<div class="offline-content">
		<div class="icon-wrapper">

			<Icon name="offline" size="3rem" />

		</div>
		<h2>You're Offline</h2>
		<p>Please check your internet connection to continue.</p>
	</div>
</div>



<style lang="sass">

	.offline-overlay
		z-index: 9999
		position: fixed
		top: 0
		left: 0
		right: 0
		bottom: 0
		background: rgba(0, 0, 0, 0.9)
		backdrop-filter: blur(4px)
		color: white
		@include flex-col-middle-center

		.offline-content
			padding: 2rem
			text-align: center

			.icon-wrapper
				margin-bottom: 1rem
				color: #ff3e00

			h2
				margin: 0 0 0.5rem 0
				font-size: 1.5rem
				font-weight: 500

			p
				margin: 0
				opacity: 0.8

</style>
