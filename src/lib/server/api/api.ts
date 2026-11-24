import { address } from 'src/lib/server/api/address'
import { auth } from 'src/lib/server/api/auth'
import { cart } from 'src/lib/server/api/cart'
import { company } from 'src/lib/server/api/company'
import { order } from 'src/lib/server/api/order'
import { payment } from 'src/lib/server/api/payment'
import { product } from 'src/lib/server/api/product'
import { user } from 'src/lib/server/api/user'



export const api: Record<string,any> = {
	...address,
	...auth,
	...cart,
	...company,
	...order,
	...payment,
	...product,
	...user,
}