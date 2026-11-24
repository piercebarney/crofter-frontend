import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

interface LocationsStore {
	subscribe:		(run:(value:PickUpLocation[]) => void, invalidate?:(value?:PickUpLocation[]) => void) => () => void
	fetch:			() => Promise<void>
	set:			(newLocations:PickUpLocation[]) => void
	get:			(id?:string|null) => PickUpLocation|null
	getByActive:	(active?:boolean) => PickUpLocation[]
	hasActive:		() => boolean
}

import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { apiV2 } from 'src/lib/apiV2'



const initialValues: PickUpLocation[] = []

const { subscribe, update } = writable(initialValues)

const createPickUpLocationsStore = (): LocationsStore => {

	const store: LocationsStore = {subscribe,

		/**
		 * Fetches pick up locations from the API
		 */
		fetch : async () => {

			const { locations } = await apiV2.locations()

		
			if (locations) update(() => locations)

		},

		/**
		 * Sets pick up locations
		 * @param locations - Array of pick up locations
		 */
		set : (locations: PickUpLocation[]) => update((v:PickUpLocation[]) => {
			
			if (locations.length > 0) v = locations
			
			return v
		}),

		/**
		 * Gets a pick up location by id
		 * @param id - Pick up location id
		 * @returns Pick up location
		 */
		get : (id:string|null = null) => {

			if (!id) return null

			const pickUpLocations: PickUpLocation[] = get(store)

			return pickUpLocations.find(location => location.id === id) ?? null
		},

		/**
		 * Gets pick up locations by activity
		 * @param active - Activity status
		 * @returns Array of pick up locations
		 */
		getByActive : (active:boolean = true) => get(store).filter(location => location.active === active),

		/**
		 * Checks if there is an active pick up location
		 * @returns Boolean
		 */
		hasActive : () => get(store).some(location => location.active)
	}

	return store
}

export const pickUpLocations = createPickUpLocationsStore()
