import { mutate, query } from 'src/lib/server/client'
import { Address } from 'src/lib/server/api/address'
import { PaymentToken } from 'src/lib/server/api/payment'



export const User:string = `
	addresses {
		${Address}
	}
	companies {
		id
		image
		name
		role
		ziftAccountId
	}
	defaultAddress {
		${Address}
	}
	email
	emailVerified
	firstName
	id
	insertedAt
	lastName
	paymentToken {
		${PaymentToken}
	}
	phoneNumber
	role
	zipCode`

export const User_Partial:string = `
	email
	firstName
	lastName
	phoneNumber`

const UserAdmin:string = `
	companies {
		id
		name
	}
	defaultAddress {
		city
		state
	}
	email
	emailVerified
	firstName
	id
	insertedAt
	lastName
	role
	phoneNumber
	zipCode`

export const user = {

	register : async (options:Record<string,any> = {}) => await mutate('register', {

		variables	: {input : {
						email		: 'String!',
						firstName	: 'String',
						lastName	: 'String',
						password	: 'String!',
						phoneNumber	: 'String',
						zipCode		: 'String!'
					}},
		fields		: 'token'
	
	}, {...options}),

	user : async (options:Record<string,any> = {}) => await query('user', {fields:User}, {...options}),

	user_defaultAddress : async (options:Record<string,any> = {}) => await query('user', {fields:`defaultAddress{${Address}}`}, {...options}),

	userUpdate : async (options:Record<string,any> = {}) => await mutate('userUpdate', {
		
		variables	: {input : {
						email			: 'String',
						emailVerified	: 'Boolean',
						firstName		: 'String',
						lastName		: 'String',
						phoneNumber		: 'String'
					}},
		fields		: User

	}, {key:'user', ...options}),

	passwordUpdate : async (options:Record<string,any> = {}) => await mutate('passwordUpdate', {

		variables	: {input : {
						newPassword	: 'String!',
						oldPassword	: 'String!'
					}},
		fields		: 'token'
	
	}, {...options}),

	userResendEmailVerification : async (options:Record<string,any> = {}) => await mutate('resendEmailVerification', {

		fields : 'success'

	}, {...options}),

	userAdmin : async (options:Record<string,any> = {}) => await query('userAdmin', {
		
		variables	: {
						getBy : {
								email		:'String',
								id			:'String',
								phoneNumber	:'String',
							},
					},
		fields		: UserAdmin
	
	}, {key:'user', ...options}),
}