<script lang="ts">

	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { skus } from 'src/stores/skus'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { statuses as s } from 'src/lists/statuses'
	import { apiV2 } from 'src/lib/apiV2'
	import Container from 'src/features/modules/modal/container.svelte'
	import A from 'src/components/elements/a.svelte'



	export let modal: any

	if ($page.url.search) modal.onClose(() => goto('/d/fulfillment', {replaceState:true}))

	const orderId	= $modal.data.orderId
	const company	= $modal.data.company
	const fetch		= $modal.data.fetch

	let order: any	= null,
		promo: any	= null
	
	$: hasPickUpFulfillment		= order && order.orderItems.some((orderItem:Record<string,any>) => orderItem.fulfillment == f.id('pickup'))
	$: hasDeliveryFulfillment	= order && order.orderItems.some((orderItem:Record<string,any>) => orderItem.fulfillment == f.id('delivery'))
	$: hasPromo					= order && order.orderItems.some((orderItem:Record<string,any>) => orderItem.promotionId)
	$: statusUnique				= order && order.orderItems.every((orderItem:Record<string,any>) => orderItem.status == order.orderItems[0].status)
	$: fulfillmentUnique		= order && order.orderItems.every((orderItem:Record<string,any>) => orderItem.fulfillment == order.orderItems[0].fulfillment)
	$: pickUpLocationUnique		= order && order.orderItems.every((orderItem:Record<string,any>) => orderItem.pickUpLocationId == order.orderItems[0].pickUpLocationId)
	$: deliveryAddressUnique	= order && order.orderItems.every((orderItem:Record<string,any>) => orderItem.deliveryAddressId == order.orderItems[0].deliveryAddressId)
	$: promoUnique				= order && order.orderItems.every((orderItem:Record<string,any>) => orderItem.promotionId == order.orderItems[0].promotionId)

	$: !order && ($company.orders.open || $company.orders.closed) && (order = company.getOrderById(orderId))
	$: !promo && hasPromo && (async () => {({promotion:promo} = await apiV2.promotion({id: order.orderItems[0].promotionId}))})()

	const cancelOrder = () => {

		modal.alert({

			type	: 'danger',
			message	: "You are about to cancel an order. This cannot be undone."

		}).then( async () => {

			const { success, error } = await company.orderCancel(orderId)

			if (error && error.message.message.includes('Failed to Cancel Order:')) {

				modal.alert({

					type:		'danger',
					title:		'Could Not to Cancel Order',
					message:	error.message.message.replace('Failed to Cancel Order: ', ''),
					buttons:	{ deny: 'OK' }
				})

			} else {

				if (success) {
					
					fetch()

					modal.alert({

						type:		'success',
						title:		'Order Canceled',
						message:	'Your order was successfully canceled. An email has been sent to notify the customer.',
						buttons:	{ accept: 'OK' }
					
					}).then( () => modal.close() )
				
				} else {

					modal.alert({

						type:		'danger',
						title:		'Error',
						message:	'An unknown error has occurred. Please contact support if the issue persists.',
						buttons:	{ deny: 'OK' }
					})
				}
			}
		})
	}

	$: console.log(order)

</script>



<Container label="Order Details" {modal} deleteButtonText="Cancel Order" onDelete={cancelOrder}>

	{#if order}
	
		<ul>
			<li>
				<span class="label">ID:</span>
				<span>{order.id}</span>
			</li>
			<li>
				<span class="label">Created:</span>
				<span>{order.date} - {order.time}</span>
			</li>
			<li>
				<span class="label">Updated:</span>
				<span>{order.dateUpdated} - {order.timeUpdated}</span>
			</li>
			<li>
				<span class="label">Customer:</span>
				<table>
					<tbody>
						<tr>
							<td width="1%"><i>name:</i></td>

							{#if order.user}

								<td>{order.user.fullName}</td>

							{:else}

								<td>Unknown Name</td>

							{/if}

						</tr>
						<tr>
							<td><i>phone:</i></td>
							<td>
								<span class="link">

									{#if order.user}

										<A href={`tel:${order.user.phoneNumber}`} inverse>{order.user.phoneNumber}</A>

									{:else}

										Unknown Phone Number

									{/if}

								</span>
							</td>
						</tr>
						<tr>
							<td><i>email:</i></td>

							{#if order.user}

								<td>{order.user.email}</td>

							{:else}

								<td>Unknown Email</td>

							{/if}

						</tr>
					</tbody>
				</table>			
			</li>
			<li>
				<span class="label">Totals:</span>
				<table>
					<tbody>
						<tr>
							<td width="1%"><i>Subtotal:</i></td>
							<td>{order.subTotal.string}</td>
						</tr>

						{#if order.deliveryFee}

							<tr>
								<td width="1%"><i>Delivery:</i></td>
								<td>{order.deliveryFee.string}</td>
							</tr>

						{/if}

						<tr>
							<td><i>Tax:</i></td>
							<td>{order.tax.string}</td>
						</tr>
						<tr>
							<td><i>Total:</i></td>
							<td>{order.total.string}</td>
						</tr>
					</tbody>
				</table>
			</li>
			<li>
				<span class="label">Promotion:</span>
				<span>{hasPromo ? (promoUnique ? (promo ? [promo.code, promo.description].filter(Boolean).join(': ') : 'loading...') : 'Multiple Promotions') : 'None'}</span>
			</li>

			{#if statusUnique}

				<li>
					<span class="label">Status:</span>
					<span>{s.titleById(order.orderItems[0].status)}</span>
				</li>

			{/if}

			{#if fulfillmentUnique}

				<li>
					<span class="label">Fulfillment:</span>
					<span>{f.titleById(order.orderItems[0].fulfillment)}</span>
				</li>

			{/if}

			{#if hasPickUpFulfillment}

				<li>
					<span class="label">Pickup Location:</span>
				
					{#if pickUpLocationUnique && order.orderItems[0].pickUpLocationId}

						{@const pickUpLocation = pL.get(order.orderItems[0].pickUpLocationId)}
		
						<span>{pickUpLocation?.title}</span>
		
					{:else if !pickUpLocationUnique}

						<span>Multiple Pickup Locations</span>
		
					{/if}

				</li>

			{/if}
			
			{#if hasDeliveryFulfillment}

				<li>
					<span class="label">Delivery Details:</span>
				
					{#if deliveryAddressUnique && order.orderItems[0].deliveryAddressId}

						{@const address = order.orderItems[0].deliveryAddress}
						{@const addressString = address ? [address.address1 ?? '', address.address2 ?? '', address.city ?? '', address.state ?? '', address.zipCode ?? ''].filter(Boolean).join(' ') : 'Unknown Address'}
						{@const mapURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`}
					
						<table>
							<tbody>
								<tr>
									<td width="1%"><i>Address:</i></td>
									<td>
										<span class="link">

											<A href={mapURL} target="_blank" inverse>{addressString}</A>
				
										</span>
									</td>
								</tr>
								<tr>
									<td><i>Instructions:</i></td>

									{#if address}

										<td>{address.deliveryInstructions ?? 'None'}</td>

									{:else}

										<td>Unknown Delivery Instructions</td>

									{/if}
									
								</tr>
							</tbody>
						</table>
						
					
					{:else if !deliveryAddressUnique}

						<span>Multiple Delivery Addresses</span>
					
					{/if}

				</li>

			{/if}

			<li>
				<span class="label">Items ({order.orderItems.length}):</span>
				<ol>
					
					{#each order.orderItems as orderItem (orderItem.skuId)}

						{#if orderItem.skuId}

							{@const sku = skus.getById(orderItem.skuId) || null}
							{@const variant = sku?.variant || null}
							{@const product = variant?.product || null}

							<li>
								<table>
									<tbody>

										{#if !sku}

											<tr>
												<td width="1%"></td>
												<td>SKU not found for this order item. Contact dev team.<br />{orderItem.skuId}</td>
											</tr>

										{/if}

										<tr>
											<td width="1%"><i>product:</i></td>
											<td>{orderItem.quantity} x {product ? product.title : '?'}</td>
										</tr>
										<tr>
											<td><i>company:</i></td>
											<td>{product ? product.company.name : '?'}</td>
										</tr>

										{#if !statusUnique}

											<tr>
												<td><i>status:</i></td>
												<td>{s.name(orderItem.status)}</td>
											</tr>

										{/if}

										{#if !fulfillmentUnique}
										
											<tr>
												<td><i>fulfillment:</i></td>
												<td>{f.get('id', orderItem.fulfillment)?.title}</td>
											</tr>
										
										{/if}

										{#if !pickUpLocationUnique && orderItem.pickUpLocationId}
										
											<tr>
												<td><i>pickup location:</i></td>
												<td>{pL.get(orderItem.pickUpLocationId)?.title}</td>
											</tr>

										{/if}

										{#if !deliveryAddressUnique && orderItem.deliveryAddressId}

											{@const address = orderItem.deliveryAddress}
											{@const addressString = address ? [address.address1 ?? '', address.address2 ?? '', address.city ?? '', address.state ?? '', address.zipCode ?? ''].filter(Boolean).join(' ') : 'Unknown Address'}
											{@const mapURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`}

											<tr>
												<td><i>delivery address:</i></td>
												<td>
													<span class="link">

														<A href={mapURL} target="_blank" inverse>{addressString}</A>

													</span>
												</td>
											</tr>
											<tr>
												<td><i>delivery instructions:</i></td>

												{#if address}

													<td>{address.deliveryInstructions ?? 'None'}</td>

												{:else}

													<td>Unknown Delivery Instructions</td>

												{/if}

											</tr>

										{/if}

										<tr>
											<td><i>price:</i></td>
											<td>{orderItem.price.string} / {variant ? variant.unit.toLowerCase() : '?'}</td>
										</tr>
										<tr>
											<td><i>subtotal:</i></td>
											<td>{orderItem.subTotal.string}</td>
										</tr>
										<tr>
											<td><i>tax:</i></td>
											<td>{orderItem.tax.string}</td>
										</tr>
										<tr>
											<td><i>total:</i></td>
											<td>{orderItem.total.string}</td>
										</tr>
									</tbody>
								</table>
							</li>

						{:else}

							<li>
								<table>
									<tbody>
										<tr>
											<td width="1%"><i>product:</i></td>
											<td>No SKU for {orderItem.id}</td>
										</tr>
									</tbody>
								</table>
							</li>

						{/if}

					{/each}

				</ol>
			</li>
		</ul>

	{/if}

</Container>



<style lang="sass">

	ul
		margin: 0
		padding: 0

		li
			list-style-type: none
			margin: 0 0 1rem 0
			padding: 0 0 0 .5rem

			.label
				margin: 0 0 .25rem -0.5rem
				font-weight: bold

			ol
				margin: 0

				li
					list-style: decimal
					margin: 0 0 1rem 0
					padding: 0 0 0 .5rem

	.link
		display: inline-block
		

</style>