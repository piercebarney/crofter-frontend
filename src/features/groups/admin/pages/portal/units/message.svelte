<script lang="ts">

	export let id: string|undefined = undefined

</script>



<span {id} class="message" style="display:none">TEST</span>



<style lang="sass">

	.message
		display: inline-block
		width: 100%
		border-top: 1px solid #ddd
		padding: 1rem
		color: #666
		font-size: 1.25rem
		text-align: center

</style>