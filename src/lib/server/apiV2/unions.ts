const processors = {

	order : async (options:Record<string,any>, endpoints:Record<string,any>) => {

		const { order, error } = await endpoints.order({...options})

		if (error) return { order:null, error }

		const { orderItems, error:orderItemsError } = await processors.orderItems(order.orderItems, endpoints)

		if (orderItemsError) return { order:null, error:orderItemsError }

		order.orderItems = orderItems

		return { order, error:null }
	},

	orderItems : async (orderItems:Record<string,any>[], endpoints:Record<string,any>) => {

		for (const orderItem of orderItems) {

			if (orderItem.skuId) {

				const { sku, error:skuError } = await endpoints.sku({id:orderItem.skuId, join:'variant.product.company'})

				if (skuError) return { order:null, error:skuError }

				orderItem.sku = sku

			} else orderItem.sku = null
		}

		return { orderItems, error:null }
	}
}

export const unions = {

	customerOrder_skusVariantProductCompany : async (options:Record<string,any> = {}, endpoints:Record<string,any>) => processors.order(options, endpoints),

	order_skusVariantProductCompany : async (options:Record<string,any> = {}, endpoints:Record<string,any>) => processors.order(options, endpoints)
}
