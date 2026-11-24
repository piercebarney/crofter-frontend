<script lang="ts">

	import A from 'src/components/elements/a.svelte'

</script>



<span class="title">WELCOME</span>

<A route="signup" role="button" secondary>Sign Up</A>

<span>Have an account? <A route="login" c="auth-link" hoverUnderline>Sign In</A></span>



<style lang="sass">

	:global(.auth-link)
		font-weight: 700

	.title
		font-size: 1.5rem
		font-weight: 900

</style>