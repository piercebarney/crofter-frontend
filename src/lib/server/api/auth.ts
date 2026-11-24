import { mutate, query } from 'src/lib/server/client'



export const auth = {
	
	login : async (options:Record<string,any> = {}) => await mutate('login', {

		variables	: {input : {
						email		: 'String!',
						password	: 'String!'
					}},
		fields		: 'token'
	
	}, {...options}),
	
	verify : async (options:Record<string,any> = {}) => await query('user', {fields:'id'}, {...options}),

	passwordReset : async (options:Record<string,any> = {}) => await mutate('resetPassword', {
		
		variables	: {input : {
						password	: 'String!',
						token		: 'String!'
					}},
		fields		: 'success'
	
	}, {...options}),

	requestPasswordReset : async (options:Record<string,any> = {}) => await mutate('requestPasswordReset', {
		
		variables	: {input:{ email:'String' }},
		fields		: 'success'
	
	}, {...options})
}