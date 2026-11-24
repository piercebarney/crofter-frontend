import { mutate } from 'src/lib/server/client'



export const Address:string = `
	address1
	address2
	city
	country
	deliveryInstructions
	id
	isDefault
	openHours
	state
	zipCode`

export const AddressDelivery:string = `
	address1
	address2
	city
	state
	zipCode`

export const Address_CityState:string = `
	city
	isDefault
	state`

export const AddressValidationMatches:string = `
	message
	potentialMatches {
		${Address}
	}
	status`

export const AddressSaveResponse:string = `
	... on Address {
		${Address}
	}
	... on AddressValidationMatches {
		${AddressValidationMatches}
	}`



export const address = {

	addressAdd_user : async (options:Record<string,any> = {}) => await mutate('userAddAddress', {

		variables	: {
						force	: 'Boolean',
						input	: {
								address1				: 'String!',
								address2				: 'String',
								city					: 'String!',
								country					: 'String',
								deliveryInstructions	: 'String',
								isDefault				: 'Boolean',
								state					: 'String!',
								zipCode					: 'String!',
							}
					},
		fields		: AddressSaveResponse,

	}, {key:'address', ...options}),

	addressAdd_company : async (options:Record<string,any> = {}) => await mutate('companyAddAddress', {

		variables	: {
						companyId	: 'String!',
						force		: 'Boolean',
						input		: {
								address1	: 'String!',
								address2	: 'String',
								city		: 'String!',
								country		: 'String',
								isDefault	: 'Boolean',
								openHours	: 'String',
								state		: 'String!',
								type		: 'AddressType',
								zipCode		: 'String!',
							}
					},
		fields		: AddressSaveResponse,

	}, {key:'address', ...options}),

	addressUpdate : async (options:Record<string,any> = {}) => await mutate('addressUpdate', {

		variables	: {
						addressId	: 'String!',
						force		: 'Boolean',
						input		: {
								address1				: 'String',
								address2				: 'String',
								city					: 'String',
								country					: 'String',
								deliveryInstructions	: 'String',
								isDefault				: 'Boolean',
								state					: 'String',
								zipCode					: 'String',
							}
					},
		fields		: AddressSaveResponse

	}, {key:'address', ...options}),

	addressDelete : async (options:Record<string,any> = {}) => await mutate('addressDelete', {

		variables	: {addressId : 'String!'},
		fields		: 'success'

	}, {...options}),
}