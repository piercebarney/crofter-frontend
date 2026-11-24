<script lang="ts">

	import type { Address } from 'src/types/address'
	import type { Company } from 'src/types/company'

	import { api } from 'src/lib/api'
	import Container from 'src/features/modules/modal/container.svelte'
	import Img from 'src/components/elements/img.svelte'
	import Rt from 'src/components/elements/rt.svelte'
	import LoaderBlock from 'src/components/loaders/block.svelte'
	import LoaderLines from 'src/components/loaders/lines.svelte'
	import { onDestroy, onMount } from 'svelte'



	export let modal: any

	// const caller: string|null	= $modal.data?.caller ? $modal.data.caller : null
	// const skuId: string|null	= $modal.data?.skuId ? $modal.data.skuId : null

	let company: Company|undefined,
		address: Address|undefined
	
	let companyId: string|undefined,
		loading: boolean = false

	const load = async (id: string) => {
		loading = true

		try {
			const response = await api.companyPage({ variables:{companyId: id} })
			company = response.company
			address = company?.addresses[0]
		} finally {
			loading = false
		}
	}

	onMount(() => {
		const unsubscribe = modal.subscribe((value: any) => {
			const nextCompanyId = value?.data?.companyId

			if (typeof nextCompanyId !== 'string') return
			if (nextCompanyId === companyId || loading) return

			companyId = nextCompanyId
			company = undefined
			address = undefined

			load(nextCompanyId)
		})

		onDestroy(unsubscribe)
	})
	
</script>



<Container label="Producer Details" {modal} closeButton={false}>

	{#if company}

		{#if company?.image}

			<div class="image">

				<Img src={company.image} />

			</div>

		{/if}

		<div class="details">
			<span class="name">{company.name}</span>

			{#if address}

				<div class="address">
					<span>from</span>
					<span>{address.city}, {address.state}</span>
				</div>

			{/if}

		</div>

		{#if company?.bio}

			<div class="bio">
				
					<Rt text={company.bio} />

			</div>

		{/if}

	{:else}

		<div class="image loader">
			
			<LoaderBlock />
		
		</div>

		<LoaderLines />

	{/if}

</Container>



<style lang="sass">

	.image
		margin: 0 -1rem
		overflow: hidden

		&.loader
			width: 100%
			aspect-ratio: 100/65

	.details
		margin-bottom: 1rem
		@include flex-col-top-left(.5rem)

		.name
			font-size: 1.2rem
			font-weight: 600

		.address
			font-size: .8rem

			span:not(:first-child)
				color: var(--cm-text-secondary-dark)


	@media (min-width: #{breakpoint('md')})

		.image
			margin: 0 -1.5rem

</style>