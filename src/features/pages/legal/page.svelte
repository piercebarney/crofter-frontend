<script lang="ts">

	import Terms from 'src/components/copy/terms.svelte'
	import PrivacyPolicy from 'src/components/copy/policies/privacy.svelte'

</script>



<div class="wrapper container">
	<div class="copy">
		<h1>Crofter Market Terms and Conditions/Privacy Policy</h1>
		<ul class="links">
			<li><a href="#terms">Terms and Conditions</a></li>
			<li><a href="#privacy">Privacy Policy</a></li>
		</ul>
	</div>

	<Terms />

	<PrivacyPolicy />

</div>



<style lang="sass">

	.wrapper
		margin-top: 3rem
		@include flex-col-top(3rem)

</style>