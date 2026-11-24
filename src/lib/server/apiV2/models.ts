import { kebabCase, formatOpenHours, formatDateShortHand, formatDateTime, formatPhone } from 'src/lib/helpers'
import currency from 'currency.js'
import { statuses } from 'src/lists/statuses'



const processors = {

	order : (order:Record<string,any>) => {

		const newOrder: Record<string,any> = {
			date					: formatDateTime(order.insertedAt, {time:false}),
			dateShortHand			: formatDateShortHand(order.insertedAt),
			dateUpdated				: formatDateTime(order.updatedAt, {time:false}),
			dateUpdatedShortHand	: formatDateShortHand(order.updatedAt),
			deliveryFee				: null,
			id						: order.id,
			idShortHand				: order.id.slice(-12).toUpperCase(),
			insertedAt				: order.insertedAt,
			orderItems				: [],
			statusDetails			: {
				fulfilled		: true,
				itemCount		: 0,
				canceledCount	: 0,
				declinedCount	: 0,
				fulfilledCount	: 0,
				orderedCount	: 0,
				readyCount		: 0,
				refundedCount	: 0
			},
			subTotal				: null,
			tax						: null,
			time					: formatDateTime(order.insertedAt, {date:false, showTimeZone:false}),
			timeUpdated				: formatDateTime(order.updatedAt, {date:false, showTimeZone:false}),
			total					: null,
			updatedAt				: order.updatedAt,
			user					: null,
			userId					: order.userId
		}

		// Use high precision for calculations
		const precision = 9

		let orderSubTotal	= currency(0, { precision }),
			orderTax		= currency(0, { precision }),
			orderTotal		= currency(0, { precision }),
			deliveryFee		= currency(0)

		if (order.user) newOrder.user = {
			...order.user,
			fullName	: [order.user.firstName, order.user.lastName].join(' '),
			phoneNumber	: formatPhone(order.user.phoneNumber)
		}

		if (order.deliveryFee) {

			deliveryFee	= currency(order.deliveryFee.amount, { precision })
			orderTotal	= orderTotal.add(deliveryFee)

			const deliveryFeeDisplay = currency(deliveryFee.value)

			newOrder.deliveryFee = {
				string	: deliveryFeeDisplay.format(),
				number	: deliveryFeeDisplay.value
			}
		}

		let isOpen = false

		for (const orderItem of order.orderItems) {

			const newOrderItem		= orderItem
			const price				= currency(orderItem.priceWhenOrdered.amount, { precision })
			const subTotal			= price.multiply(orderItem.quantity)
			const tax				= currency(orderItem.salesTax.amount, { precision })
			const total				= subTotal.add(tax)
			const priceDisplay		= currency(price.value)
			const subTotalDisplay	= currency(subTotal.value)
			const taxDisplay		= currency(tax.value)
			const totalDisplay		= currency(total.value)

			orderSubTotal	= orderSubTotal.add(subTotal)
			orderTax		= orderTax.add(tax)
			orderTotal		= orderTotal.add(total)

			// Convert to 2 decimals for display
			newOrderItem.price		= {string:priceDisplay.format(), number:priceDisplay.value}
			newOrderItem.subTotal	= {string:subTotalDisplay.format(), number:subTotalDisplay.value}
			newOrderItem.tax		= {string:taxDisplay.format(), number:taxDisplay.value}
			newOrderItem.total		= {string:totalDisplay.format(), number:totalDisplay.value}

			newOrder.orderItems.push(newOrderItem)

			const status = orderItem.status

			newOrder.statusDetails.itemCount++

			if (statuses.is('ordered', status) || statuses.is('declined', status) || statuses.is('ready', status)) isOpen = true

			if		(statuses.is('canceled', status))	newOrder.statusDetails.canceledCount++
			else if	(statuses.is('declined', status))	newOrder.statusDetails.declinedCount++
			else if	(statuses.is('fulfilled', status))	newOrder.statusDetails.fulfilledCount++
			else if	(statuses.is('ordered', status))	newOrder.statusDetails.orderedCount++
			else if	(statuses.is('ready', status))		newOrder.statusDetails.readyCount++
			else if	(statuses.is('refunded', status))	newOrder.statusDetails.refundedCount++

			if (!statuses.is('fulfilled', status)) newOrder.statusDetails.fulfilled = false
		}

		const orderSubTotalDisplay	= currency(orderSubTotal.value)
		const orderTaxDisplay		= currency(orderTax.value)
		const orderTotalDisplay		= currency(orderTotal.value)

		// Convert order totals to 2 decimals for display
		newOrder.subTotal	= {string:orderSubTotalDisplay.format(), number:orderSubTotalDisplay.value}
		newOrder.tax		= {string:orderTaxDisplay.format(), number:orderTaxDisplay.value}
		newOrder.total		= {string:orderTotalDisplay.format(), number:orderTotalDisplay.value}

		return {newOrder, isOpen}
	},

	price : (price:Record<string,any>) => {

		const precision		= 9 // Use high precision for calculations, format to 2 decimals only at the end
		const priceDisplay	= currency(price.amount, { precision })
					
		return {
			string	: currency(priceDisplay.value).format(),
			number	: priceDisplay.value
		}
	}

}

export const models: Record<string, any> = {

	pickupLocations : {

		locations : {

			options : (options:Record<string,any>) => ({...options, key:'locations', join:'address'}),

			data : (data:Record<string,any>[]) => {

				const locations: Record<string,any>[] = []

				for (const location of data) {

					if (!location.active) continue

					const openHours	= formatOpenHours(location.openHours)
					const address	= location.address
					const asSplit	= [
						`${address.address1}${address.address2 ? ' ' + address.address2 : ''}`,
						`${address.city}, ${address.state} ${address.zipCode}`
					]

					locations.push({
						active						: location.active,
						address						: {
								address1	: address.address1,
								address2	: address.address2,
								asString	: `${asSplit[0]}, ${asSplit[1]}`,
								asSplit		: asSplit,
								city		: address.city,
								state		: address.state,
								zipCode		: address.zipCode
							},
						attachedStorageLocationId	: location.attachedStorageLocationId,
						id							: location.id,
						isDefault					: false,
						name						: kebabCase(location.name.toLowerCase()),
						openHours,
						title						: location.name
					})
				}

				return locations
			}
		}
	},

	orderItems : {

		cartItems : {

			options : (options:Record<string,any>) => ({...options, key:'cartItems', filter:{status:'carted', userId:options.userId}}),

			data : (data:Record<string,any>[]) => {

				const cartItems: Record<string,any>[] = []

				for (const cartItem of data) {
					
					cartItems.push({
						id					: cartItem.id,
						skuId				: cartItem.skuId,
						fulfillment			: cartItem.fulfillment,
						quantity			: cartItem.quantity,
						pickUpLocationId	: cartItem.pickUpLocationId || null,
						deliveryAddressId	: cartItem.deliveryAddressId || null
					})
				}
				
				return cartItems
			}			
		},

		cartItemAdd : {
			
			options : (options:Record<string,any>) => ({...options, key:'cartItemId', get:'id'}),

			data : (data:Record<string,any>) => data.id
		},

		cartItemUpdate : {

			options : (options:Record<string,any>) => ({...options, key:'cartItemId', get:'id'}),

			data : (data:Record<string,any>) => data.id
		},

		cartItemDelete : {

			options : (options:Record<string,any>) => ({...options, set:{...options.set, quantity:0}, key:'cartItemId', get:'id'}),

			data : (data:Record<string,any>) => data.id
		},

		calculateCosts : {

			options : (options:Record<string,any>) => ({...options, key:'details'}),

			data : (data:Record<string,any>) => {

				// console.log('calculateCosts', data)

				const deliveryChargeThreshold	= {string:'$80.00', number:80}
				const deliveryBaseFee			= {string:'$8.00', number:8}

				// Safety: handle empty orderItems
				if (!data.orderItems || data.orderItems.length === 0) return {
					subTotal			: {string:'$0.00', number:0},
					deliveryBaseFee,
					deliveryTotal		: {string:'$0.00', number:0},
					tax					: {string:'$0.00', number:0},
					total				: {string:'$0.00', number:0},
					promo				: null
				}

				const precision		= 9 // Use high precision for calculations, format to 2 decimals only at the end
				const promoApplied	= data.promotionApplied
				const promo			= data.promotion || null

				let deliveryTotal		= currency(deliveryBaseFee.number, { precision }),
					hasTaxData			= data.orderItems[0]?.salesTax // Check first item for tax (all items will have same tax state)
											? true
											: false,
					tax					= currency(0, { precision }),
					subTotal			= currency(0, { precision }),
					hasPriceDiscount	= false,
					hasDeliveryDiscount	= false

				if (promoApplied && promo) {

					// Check for delivery discounts
					if (promo.deliveryReduction?.amount > 0 || promo.deliveryRatio < 1) {

						hasDeliveryDiscount	= true

						if		(promo.deliveryReduction?.amount > 0)	deliveryTotal = deliveryTotal.subtract(currency(promo.deliveryReduction.amount, { precision }))
						else if	(promo.deliveryRatio < 1)				deliveryTotal = deliveryTotal.multiply(promo.deliveryRatio)
						
						// if deliveryTotal is less than 0, set it to 0
						if (deliveryTotal.value < 0) deliveryTotal = currency(0, { precision })
					}
					
					// Check for price discounts
					if (promo.priceReduction?.amount > 0 || promo.priceRatio < 1) hasPriceDiscount = true
				}
				
				for (const item of data.orderItems) {
				
					// Accumulate tax if present
					if (hasTaxData) {

						try {

							tax = tax.add(currency(item.salesTax.amount, { precision }))

						} catch {

							hasTaxData	= false
							tax			= currency(0, { precision })
						}
					}

					// Calculate item total with full precision
					const itemTotal = currency(item.priceWhenOrdered.amount, { precision }).multiply(item.quantity)

					subTotal = subTotal.add(itemTotal)
				}

				// Calculate total with precision
				const total = hasTaxData ? tax.add(subTotal) : subTotal
				
				// Convert back to 2 decimal precision for display formatting
				const subTotalDisplay		= currency(subTotal.value)
				const deliveryTotalDisplay	= currency(deliveryTotal.value)
				const taxDisplay			= currency(tax.value)
				const totalDisplay			= currency(total.value)

				// console.log(hasTaxData, tax.value)
				
				return {
					subTotal				: {string:subTotalDisplay.format(), number:subTotal.value},
					deliveryChargeThreshold,
					deliveryBaseFee,
					deliveryTotal			: {string:deliveryTotalDisplay.format(), number:deliveryTotal.value},
					tax						: hasTaxData
												? {string:taxDisplay.format(), number:tax.value}
												: null,
					total					: {string:totalDisplay.format(), number:total.value},
					promoApplied,
					promo,
					hasPriceDiscount,
					hasDeliveryDiscount
				}	
			}	
		}
	},

	orders : {

		orderSubmit : {

			options : (options:Record<string,any>) => ({...options, key:'orderId', method:'POST'}),

			data : (data:Record<string,any>) => data.id
		},

		customerOrder : {

			options : (options:Record<string,any>) => ({...options, key:'order', join:'orderItems'}),

			data : (data:Record<string,any>) =>{

				const { newOrder:order } = processors.order(data)
				
				return order
			}
		},

		customerOrders : {

			options : (options:Record<string,any>) => ({...options, key:'orders', join:'orderItems', sort:'insertedAt'}),

			data : (data:Record<string,any>[]) => {

				const orders: {open:Record<string,any>[], closed:Record<string,any>[]} = {open:[], closed:[]}

				for (const order of data) {

					const { newOrder, isOpen } = processors.order(order)

					if	(isOpen)	orders.open.push(newOrder)
					else			orders.closed.push(newOrder)
				}

				return orders
			}
		},

		ordersOpen : {

			options : (options:Record<string,any>) => ({...options, key:'orders', join:'orderItems.deliveryAddress,user', filter:{numOpenItems:{gt:0}}, sort:'insertedAt'}),

			data : (data:Record<string,any>[]) => {

				const orders: Record<string,any>[] = []

				for (const order of data) orders.push(processors.order(order).newOrder)

				return orders
			}
		},

		ordersClosed : {

			options : (options:Record<string,any>) => ({...options, key:'orders', join:'orderItems.deliveryAddress,user', filter:{numOpenItems:0}, limit:25, sort:'-updatedAt'}),

			data : (data:Record<string,any>[]) => {

				const orders: Record<string,any>[] = []

				for (const order of data) orders.push(processors.order(order).newOrder)
				
				return orders
			}
		},

		orderDetails : {

			options : (options:Record<string,any>) => ({...options, key:'order', join:'orderItems,user'}),

			data : (data:Record<string,any>) => {

				const { newOrder:order } = processors.order(data)
				
				return order
			}
		}
	},

	skus : {
		
		skusOrderedByCompany : {

			options : (options:Record<string,any>) => ({...options, join:'variant.product.company'}),

			data : (data:Record<string,any>[]) => {

				const precision = 9

				for (const sku of data) {

					const price = currency(sku.variant.price.amount, { precision })
					
					sku.variant.price = {
						string	: currency(price.value).format(),
						number	: price.value
					}
				}

				return data.sort((a, b) => a.variant.product.company.name.localeCompare(b.variant.product.company.name))
			}				
		}
	},

	products : {

		variants : {

			options : (options:Record<string,any>) => ({...options, join:'variants,company', key:'variants'}),

			data : (data:Record<string,any>[]) => {

				const precision = 9

				return data.flatMap(product => {
					
					// Skip products without variants
					if (!product.variants || !Array.isArray(product.variants)) return []

					// Create clean product reference without variants (immutable)
					const {variants, ...productWithoutVariants} = product

					// Map each variant with its product reference and format price
					return variants.map(variant => {

						const price = currency(variant.price.amount, { precision })

						return {
							...variant,
							price: {
								string: currency(price.value).format(),
								number: price.value
							},
							product: productWithoutVariants
						}
					})
				})
			}
		},

		productListItems : {

			options : (options:Record<string,any>) => ({...options, join:'variants,company', key:'products'}),

			data : (data:Record<string,any>[]) => {

				// Format data.product.variant.price
				for (const product of data) {
					for (const variant of product.variants) {
						variant.price = processors.price(variant.price)
					}
				}
			
				return data
			}
		}
	},

	users : {
	
		userByToken : {
			options : (options:Record<string,any>) => ({...options, key:'user', join:'addresses,companies', get:{user:'email,emailVerified,firstName,id,insertedAt,lastName,paymentTokenInfo,phoneNumber,role',company:'id,image,name,role,ziftAccountId'}}),
			data : (data:Record<string,any>) => {

				// console.log(data)

				data.defaultAddress	= null
				data.paymentToken	= null
				data.zipCode		= null

				const isZipCodeOnlyAddress = (address: any) => {

					return address.zipCode && ((!address.city || address.city === null || address.city === '') || (!address.state || address.state === null || address.state === ''))
				}

				if (!data.addresses || data.addresses.length === 0) {

					data.zipCode		= null
					data.defaultAddress	= null
				
				} else if (data.addresses.length === 1) {

					const address = data.addresses[0]

					if (isZipCodeOnlyAddress(address)) {
						
						data.zipCode		= address.zipCode
						data.defaultAddress	= null
					
					} else {

						address.isDefault	= true
						data.defaultAddress	= address
						data.zipCode		= address.zipCode
					}
				
				} else {

					const nonZipCodeOnlyAddresses = data.addresses.filter((addr: any) => !isZipCodeOnlyAddress(addr))

					if (nonZipCodeOnlyAddresses.length === 0) {

						data.zipCode 		= null
						data.defaultAddress	= null
					
					} else {
					
						nonZipCodeOnlyAddresses.sort((a: any, b: any) => new Date(b.isDefault).getTime() - new Date(a.isDefault).getTime())

						const firstAddress			= nonZipCodeOnlyAddresses[0]
						const hasDistinctDefault	= nonZipCodeOnlyAddresses.some((addr: any) => new Date(addr.isDefault).getTime() !== new Date(firstAddress.isDefault).getTime())

						let defaultAddress

						if	(hasDistinctDefault)	defaultAddress = firstAddress
						else						defaultAddress = nonZipCodeOnlyAddresses[0]

						defaultAddress.isDefault	= true
						data.defaultAddress			= defaultAddress
						data.zipCode				= defaultAddress.zipCode

						nonZipCodeOnlyAddresses.forEach((addr: any) => {

							if (addr !== defaultAddress) addr.isDefault = false

						})
					}
				}

				if (data.addresses) data.addresses = data.addresses.filter((addr: any) => !isZipCodeOnlyAddress(addr))

				if (data.paymentTokenInfo.length > 0) {

					// sort data.paymentTokenInfo by updatedAt to put the most recently updated token first
					data.paymentTokenInfo.sort((a:any, b:any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

					data.paymentToken = data.paymentTokenInfo[0]
				}

				// cycle through companies and set role to all caps
				for (const company of data.companies) company.role = company.role.toUpperCase()

				delete data.paymentTokenInfo
				
				return data
			}
		}
	}
}