import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

import { pickUpLocations } from 'src/stores/pickUpLocations'
import zipcodes from 'zipcodes'



// Check Distance
const maxDist = 30

const _getLatLng = (zip:string) : zipcodes.ZipCode|undefined => zipcodes.lookup(zip)

const _getDistanceMiles = (lat1:number, lon1:number, lat2:number, lon2:number) : number => {

	// Haversine formula
	const toRad = (x:number) => x * Math.PI / 180

	const R		= 3958.8 // miles
	const dLat	= toRad(lat2 - lat1)
	const dLon	= toRad(lon2 - lon1)
	const a		= Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
	const c		= 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
	
	return R * c
}

const _getClosestLocation = (zipCode:string, locations:PickUpLocation[]) : { locationName:string|null, distance:number } => {

	const userLatLng: zipcodes.ZipCode|undefined = _getLatLng(zipCode)

	if (!userLatLng) return { locationName:null, distance:Infinity }

	let minDist					= Infinity,
		closest: string|null	= null

	for (const location of locations) {

		const optLatLng: zipcodes.ZipCode|undefined = _getLatLng(location.address.zipCode)

		if (!optLatLng) continue

		const dist = _getDistanceMiles(userLatLng.latitude, userLatLng.longitude, optLatLng.latitude, optLatLng.longitude)
		
		if (dist < minDist) {

			minDist = dist
			closest	= location.name
		}
	}

	return { locationName:closest, distance:minDist }
}

const _processLocations = (zipCode:string, locations:PickUpLocation[]) : boolean => {

	const { distance } = _getClosestLocation(zipCode, locations)

	if (maxDist > 0) {

		if	(distance <= maxDist) return true
		
		return false
	}

	return true
}

export const checkDistance = (zipCode:string|null) : boolean => {

	if (!zipCode) {

		if (maxDist > 0) return false

		return true
	}

	const locations = pickUpLocations.getByActive()

	return _processLocations(zipCode, locations)
}