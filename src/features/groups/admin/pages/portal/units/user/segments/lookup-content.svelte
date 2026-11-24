<script lang="ts">

	import type { UserObject, UserData } from 'src/features/groups/admin/pages/portal/types'

	// import { api } from 'src/lib/api'
	import SectionContent from 'src/features/groups/admin/pages/portal/wrappers/section-content.svelte'
	import InputGroup from 'src/features/groups/admin/pages/portal/wrappers/input-group.svelte'
	import Lookup from 'src/features/groups/admin/pages/portal/wrappers/lookup.svelte'
	import UserCard from 'src/features/groups/admin/pages/portal/units/user/partials/user-card.svelte'
	// import UpdateGroup from 'src/features/groups/admin/pages/portal/wrappers/update-group.svelte'



	export let user:			UserObject
	export let userData:		UserData|null
	// export let companyFetch:	CompanyFetch|undefined
	export let active:			boolean					= false

	// const userResendEmailVerification = async () => {

	// 	const { success } = await api.userResendEmailVerification({variables:{userId:userData?.id}})

	// 	if	(success)	alert('Email verification email sent')
	// 	else			alert('Failed to send email verification email')

	// }

</script>



<SectionContent section="user" name="lookup" active={active}>

	<InputGroup slot="controls">

		<input type="text" placeholder="Search" bind:value={user.searchTerm} />
		<button on:click={() => user.search('id')} disabled={user.searchTerm == ''}>by ID</button>
		<button on:click={() => user.search('email')} disabled={user.searchTerm == ''}>by Email</button>
		<button on:click={() => user.search('phoneNumber')} disabled={user.searchTerm == ''}>by Phone</button>
		<button on:click={() => user.search('clear')} disabled={userData == null && user.searchTerm == ''}>Clear</button>

	</InputGroup>
	
	{#if userData}

		<Lookup>

			<!-- <UserCard user={userData} {companyFetch} /> -->
			<UserCard user={userData} />

			<!-- <UpdateGroup>

				<span>Role</span>
				<input type="text" bind:value={userData.role} placeholder="Role" on:keyup={() => user.updateRoleChanged = true} />
				<button on:click={() => user.update('role')} disabled={!user.updateRoleChanged}>Update</button>
			
			</UpdateGroup> -->

			<!-- {#if userData.emailVerified === false}

				<div class="input-button-group">
					<button on:click={() => userResendEmailVerification()}>Resend Email Verification</button>
				</div>

			{/if} -->

		</Lookup>

	{/if}

</SectionContent>