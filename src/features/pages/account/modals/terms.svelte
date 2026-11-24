<script lang="ts">

	import Container from 'src/features/modules/modal/container.svelte'
	import Terms from 'src/components/copy/terms.svelte'
	import PrivacyPolicy from 'src/components/copy/policies/privacy.svelte'


	export let modal: any

</script>



<Container label="Terms and Conditions" {modal}>

	<div class="wrapper">
		<div class="copy">
			<h1>Crofter Market Terms and Conditions/Privacy Policy</h1>
		</div>

		<Terms />

		<PrivacyPolicy />

	</div>

</Container>



<style lang="sass">

	.wrapper
		@include flex-col-top(3rem)

</style>
