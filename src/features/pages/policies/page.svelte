<script lang="ts">

	import FulfillmentPolicy from 'src/components/copy/policies/fulfillment.svelte'
	import PrivacyPolicy from 'src/components/copy/policies/privacy.svelte'

</script>



<div class="wrapper container">
	<div class="copy">
		<h1>Crofter Market Policies</h1>
		<ul class="links">
			<li><a href="#fulfillment">Fulfillment Policy</a></li>
			<li><a href="#privacy">Privacy Policy</a></li>
		</ul>
	</div>

	<FulfillmentPolicy />
	
	<PrivacyPolicy />

</div>



<style lang="sass">

	.wrapper
		margin-top: 3rem
		@include flex-col-top(3rem)

</style>