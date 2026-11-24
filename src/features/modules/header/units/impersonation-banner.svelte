<script lang="ts">
	import { impersonation } from 'src/stores/impersonation'
	import { onMount } from 'svelte'
	
	$: impersonationState = $impersonation
	
	onMount(() => {
		// Check cookies directly on mount
		const getCookie = (name: string): string | null => {
			const nameEQ = name + "="
			const ca = document.cookie.split(';')
			for(let i = 0; i < ca.length; i++) {
				let c = ca[i]
				while (c.charAt(0) == ' ') c = c.substring(1, c.length)
				if (c.indexOf(nameEQ) == 0) {
					const value = c.substring(nameEQ.length, c.length)
					try {
						return decodeURIComponent(value)
					} catch {
						return value
					}
				}
			}
			return null
		}
		
		const userId = getCookie('ImpersonatedUserId')
		const userEmail = getCookie('ImpersonatedUserEmail')
		
		
		// If cookies exist but store doesn't reflect it, update the store
		if (userId && !impersonationState.isImpersonating) {
			impersonation.startImpersonation(userId, userEmail || userId)
		}
	})
	
	const stopImpersonation = () => {
		// Stop impersonation locally
		impersonation.stopImpersonation()
		
		// Redirect to admin portal
		window.location.href = '/admin'
	}
</script>

{#if impersonationState.isImpersonating}
	<button class="impersonation-banner" on:click={stopImpersonation} title="Click to stop impersonation">
		<span class="banner-icon">👤</span>
		<span class="banner-text">
			Impersonating <strong>{impersonationState.impersonatedUserEmail || 'User'}</strong>
		</span>
	</button>
{/if}

<style lang="sass">
	.impersonation-banner
		position: fixed
		top: 30px
		left: 0.5rem
		width: fit-content
		max-width: 300px
		background: linear-gradient(90deg, #ff6b6b, #ee5a24)
		color: white
		padding: 0.4rem 0.75rem
		z-index: 9999
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15)
		animation: slideIn 0.3s ease-out
		font-size: 0.75rem
		line-height: 1.2
		border: none
		border-radius: 20px
		cursor: pointer
		display: inline-flex
		align-items: center
		gap: 0.4rem
		transition: all 0.2s

		&:hover
			background: linear-gradient(90deg, #ff5252, #dd4a1a)
			transform: scale(1.05)
			box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2)

		&:active
			transform: scale(0.98)

	.banner-icon
		font-size: 0.875rem

	.banner-text
		
		strong
			font-weight: 600

	@keyframes slideIn
		from
			transform: translateX(-100%)
			opacity: 0
		to
			transform: translateX(0)
			opacity: 1

	@media (max-width: 768px)
		.impersonation-banner
			font-size: 0.7rem
			padding: 0.35rem 0.6rem
			top: 0.3rem
			left: 0.3rem
</style>