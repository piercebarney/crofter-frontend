<script lang="ts">

	import type { Keys, Sections, Objects, TabKeys, UserTabKeys, UserTabs, UserObject, UserData, UserFetchVariables, MessageOptions } from 'src/features/groups/admin/pages/portal/types'

	import { apiV2 } from 'src/lib/apiV2'
	import Section from 'src/features/groups/admin/pages/portal/wrappers/section.svelte'
	import Tab from 'src/features/groups/admin/pages/portal/partials/section-tab.svelte'
	import Lookup from 'src/features/groups/admin/pages/portal/units/user/segments/lookup-content.svelte'


	
	export let key:			Keys
	export let title:		string
	export let sections:	Sections
	export let objects:		Objects
	
	const tabs: UserTabs = { company:'lookup', product:'lookup', user:'lookup' } // needs some TLC

	let userData:		UserData|null									= null,
		tabSelector: 	(sectionName:Keys, tabName:TabKeys) => void,
		messageUpdate: 	(id:string, options:MessageOptions) => void

	const user: UserObject = {
		searchTerm			: '',
		updateRoleValue		: '',
		updateRoleChanged	: false,

		tabs : (tabName:UserTabKeys) => tabSelector('user', tabName),

		search : (type:string) => {

			if (type == 'clear') {

				user.searchTerm	= ''
				userData		= null

			} else user.fetch({[type]:user.searchTerm})	
		},

		update : async (key:string) => {

			messageUpdate('user-lookup', { message: 'Updating...', type: 'info', display: true })

			switch (key) {

				case 'role': {

					const { error:roleError } = await apiV2.user({ id:userData?.id, set:{role:userData?.role} })

					if (roleError) {

						console.error('user: update role error', roleError)
						
						messageUpdate('user-lookup', { message: 'Server Error: Could not update role', type: 'error' })
					}
					else {

						console.log('user: update role success')
				
						user.updateRoleChanged = false

						messageUpdate('user-lookup', { display: false })
					}

					break
				}
			}
		},

		fetch : async (variables:UserFetchVariables) => {

			userData				= null
			user.updateRoleChanged	= false

			if (tabs.user != 'lookup') user.tabs('lookup')

			messageUpdate('user-lookup', { message: 'Loading...', type: 'info', display: true })

			const { user:u, error } = await apiV2.user({ filter:variables })

			if (error) {

				console.error('user: fetch error', error)
				
				messageUpdate('user-lookup', { message: 'Server Error: Could not fetch user', type: 'error' })
			}
			else if (u.length > 0) {

				userData = u[0]

				messageUpdate('user-lookup', { display: false })

			} else {

				console.log('user: fetch no user found')
				
				messageUpdate('user-lookup', { message: 'User not found', type: 'none' })
			}
		}
	}

	$: user && objects.user == null && (objects.user = user)

</script>



<Section {key} {title} {sections} {tabs} bind:tabSelector={tabSelector} bind:messageUpdate={messageUpdate}>

	<svelte:fragment slot="tabs">

		<Tab name="lookup" tab={user.tabs} active>Lookup</Tab>

	</svelte:fragment>

	<!-- <Lookup {user} {userData} companyFetch={objects.company?.fetch} active /> -->
	<Lookup {user} {userData} active />

</Section>