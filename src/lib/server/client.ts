import type { GQLBody } from 'src/lib/server/clientHelpers'

import { PUBLIC_API_URL } from '$env/static/public'
import { ApolloClient, InMemoryCache } from '@apollo/client/core/index'
import { createLink } from 'apollo-absinthe-upload-link'
//import fetch from 'node-fetch'
import { build } from 'src/lib/server/clientHelpers'



const clientOptions = {
	link	: createLink({uri:`${PUBLIC_API_URL}/api`, fetch}),
	cache	: new InMemoryCache(),
}

export const query = async (name:string, body:GQLBody|string, options:Record<string,any> = {}) => build(new ApolloClient(clientOptions), 'query', name, body, options)

export const mutate = async (name:string, body:GQLBody|string, options:Record<string,any> = {}) => build(new ApolloClient(clientOptions), 'mutation', name, body, options)