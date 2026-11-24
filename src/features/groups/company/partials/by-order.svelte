<script lang="ts">

	import type { OrderByOrder_Company } from 'src/types/order'

	import { layout } from 'src/stores/layout'
	import { search } from 'src/features/groups/search/store'
	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { orderStatuses as s } from 'src/lists/order-statuses'
	import Button from 'src/components/elements/button.svelte'
	// import Icon from 'src/components/elements/icon/element.svelte'



	export let ordersOpen: OrderByOrder_Company[]|null
	export let ordersClosed: {
		recent: OrderByOrder_Company[]|null,
		all: OrderByOrder_Company[]|null,
		total: number
	}|null
	export let filterFulfillmentMethod: string
	export let filterOrderStatus: string
	export let sortLocationId: string|null		= null
	export let company: any
	export let fetch: any

	let open: OrderByOrder_Company[]	= []
	let closed: OrderByOrder_Company[]	= []
	let hasOpen: boolean				= false
	let hasClosed: boolean				= false
		
	const readyAlert = {
		type	: 'warning',
		title	: 'Ready Item',
		message	: 'Are you sure want to mark this item as ready? This will charge and notify the customer.',
	}

	const readyAllAlert = {
		type	: 'warning',
		title	: 'Ready All Items',
		message	: 'Are you sure want to mark all items as ready? This will charge and notify the customer.',
	}

	const filter = () => {

		if (open.length > 0) {

			hasOpen = false
		
			open.forEach((order, orderIndex) => {

				let showOrder = false

				order.orderItems.forEach((orderItem, orderItemIndex) => {

					let sameFulfillmentMethod	= false,
						sameOrderStatus			= false

					if	(filterFulfillmentMethod == 'all' || orderItem.fulfillment == f.id(filterFulfillmentMethod)) sameFulfillmentMethod = true

					if	(filterOrderStatus == 'all' || orderItem.status == s.id(filterOrderStatus)) sameOrderStatus = true

					if (sameFulfillmentMethod && sameOrderStatus) {

						open[orderIndex].orderItems[orderItemIndex].show	= true
						showOrder											= true
						hasOpen												= true
					
					} else open[orderIndex].orderItems[orderItemIndex].show	= false
				})

				open[orderIndex].show = showOrder
			})
		
		} else hasOpen = false

		if (closed.length > 0) {

			hasClosed = false
		
			closed.forEach((order, orderIndex) => {

				let showOrder = false

				order.orderItems.forEach((orderItem, orderItemIndex) => {

					let sameFulfillmentMethod	= false,
						sameOrderStatus			= false

					if	(filterFulfillmentMethod == 'all' || orderItem.fulfillment == f.id(filterFulfillmentMethod)) sameFulfillmentMethod = true

					if	(filterOrderStatus == 'all' || orderItem.status == s.id(filterOrderStatus)) sameOrderStatus = true

					if (sameFulfillmentMethod && sameOrderStatus) {

						closed[orderIndex].orderItems[orderItemIndex].show	= true
						showOrder											= true
						hasClosed											= true
					
					} else closed[orderIndex].orderItems[orderItemIndex].show = false
				})

				closed[orderIndex].show	= showOrder
			})
			
		} else hasClosed = false
	}

	const fetchAll = () => {

		if (showAll) {

			showAll = false
			
			return
		}

		showAll = true

		if (allCount != closedTotal) {

			if	(searchActive)	company.ordersByOrderSearchFetchAllClosed(sortLocationId, searchTerm)
			else				company.ordersByOrderFetchAllClosed(sortLocationId)
		}
	}

	let showAll: boolean = false

	$: isMobile			= $layout.isMobile
	$: isTablet			= $layout.isTablet
	$: recent			= ordersClosed?.recent || []
	$: all				= ordersClosed?.all || []
	$: closedTotal		= ordersClosed?.total || 0
	$: recentCount		= recent.length || 0
	$: allCount			= all.length || 0
	$: moreOrders		= closedTotal > recentCount
	$: searchActive		= $search.active
	$: searchSearching	= $search.searching
	$: searchTerm		= $search.term

	$: if (ordersOpen || filterFulfillmentMethod || filterOrderStatus) {

		open = ordersOpen || []
		closed = showAll ? all : recent
		hasOpen = open.length > 0
		hasClosed = closedTotal > 0

		filter()
	}

	$: if (showAll !== undefined) {

		closed = showAll ? all : recent
	}

	$: searchActive && (showAll = false)

</script>



<div class="orders-by-order-wrapper">

	{#if (hasOpen || hasClosed) && searchSearching == false}

		<div class="label-open">
			<span>Open Orders</span>
			<div>

				{#if filterFulfillmentMethod !== 'all' || filterOrderStatus !== 'all' || searchActive}
				
					<span>({#if searchActive}Search Results{/if}{#if (filterFulfillmentMethod !== 'all' || filterOrderStatus !== 'all') && searchActive} | {/if}{#if filterFulfillmentMethod !== 'all' || filterOrderStatus !== 'all'}Filtered{/if})</span>
					
				{/if}

			</div>
		</div>

		{#if hasOpen}

			<table class={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}>
				<tbody>

					{#if isMobile}

						{#each open as {createdDate, fulfilledCount, id:orderId, newCount, orderItems, show, user} (orderId)}

							{#if show}

								<tr class="order">
									<td>
										<div>
											<span class="date">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
											<div class="customer">
												<span class="phone-number">{user.phoneNumber}</span>
												<span class="name">{user.firstName} {user.lastName}</span>
											</div>
											<span class="order-status">{fulfilledCount} of {orderItems.length} Fulfilled</span>
										</div>
									</td>
								</tr>

								{#each orderItems as {distributorLocation, fulfillment, id, product, quantity, status:statusId} (id)}

									{@const status = s.name(statusId)}

									<tr class="item">
										<td>
											<div>
												<div>
													
													{#if distributorLocation}
													
														<span class="location">{$pL.find(l => l.id == distributorLocation.id)?.title}</span>
												
													{/if}

												</div>
												<div>
													<span class="quantity">{quantity}</span>
													<span class="multiple">x</span>
													<span class="title">{product.title}</span>
												</div>
												<div>
													<div>
														<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
														<span class="divide">|</span>
														<span class="item-status">{s.titleById(statusId)}</span>
													</div>
													<div>

														{#if status == 'new'}

															<div class="item-buttons">

																<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('ready'))} alert={readyAlert} pill mini>Mark as Ready</Button>

															</div>

														{:else if status == 'ready'}

															<!-- <div class="undo">

																<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('new'))} outline text pill mini>
																
																	<Icon name="arrowUturnBack" size="1.25rem" />

																</Button>

															</div> -->
															<div class="item-buttons">

																<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('fulfilled'))} pill mini>Mark as Fulfilled</Button>

															</div>

														{/if}

													</div>
												</div>
											</div>
										</td>
									</tr>

								{/each}

								<tr class="buttons">
									<td>
										<div>
											<div>

												<Button modal="company-order-details" data={{orderId, company, fetch}} outline text pill mini>Details</Button>

											</div>

											{#if orderItems.length - fulfilledCount > 1}

												<div>

													{#if newCount && newCount > 0}

														<Button action={() => company.ordersUpdateOrderStatus(orderId, s.id('ready'))} alert={readyAllAlert} outline text pill mini>Mark All as Ready</Button>

													{:else}

														<Button action={() => company.ordersUpdateOrderStatus(orderId, s.id('fulfilled'))} outline text pill mini>Mark All as Fulfilled</Button>

													{/if}

												</div>

											{/if}

										</div>
									</td>
								</tr>

							{/if}

						{/each}

					{:else if isTablet}

						{#each open as {createdDate, fulfilledCount, id:orderId, newCount, orderItems, show, user} (orderId)}

							{#if show}

								<tr class="order">
									<td colspan="5">
										<div>
											<span class="date">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
											<div class="customer">
												<span class="phone-number">{user.phoneNumber}</span>
												<span class="name">{user.firstName} {user.lastName}</span>
											</div>
											<span class="order-status">{fulfilledCount} of {orderItems.length} Fulfilled</span>
										</div>
									</td>
								</tr>

								{#each orderItems as {distributorLocation, fulfillment, id, product, quantity, status:statusId} (id)}

									{@const status = s.name(statusId)}

									<tr class="item">

										<td>
											<span class="quantity">{quantity}</span>
										</td>
										<td>
											<span class="multiple">x</span>
										</td>
										<td>

											{#if distributorLocation}
												
												<span class="location">{$pL.find(l => l.id == distributorLocation.id)?.title}</span>

											{/if}

											<span class="title">{product.title}</span>
										</td>
										<td>
											<div>
												<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
												<span class="divide">|</span>
												<span class="item-status">{s.titleById(statusId)}</span>
											</div>
										</td>
										<td>
											<div>

												{#if status == 'new'}

													<div class="item-buttons">

														<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('ready'))} alert={readyAlert} pill mini>Mark as Ready</Button>

													</div>

												{:else if status == 'ready'}

													<!-- <div class="undo">

														<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('new'))} outline text pill mini>Undo</Button>

													</div> -->
													<div class="item-buttons">

														<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('fulfilled'))} pill mini>Mark as Fulfilled</Button>

													</div>

												{/if}

											</div>
										</td>
									</tr>

								{/each}

								<tr class="buttons">
									<td colspan="5">
										<div>
											<div>

												<Button modal="company-order-details" data={{orderId, company, fetch}} outline text pill mini>View Details</Button>

											</div>

											{#if orderItems.length - fulfilledCount > 1}

												<div class="order-buttons">

													{#if newCount && newCount > 0}

														<Button action={() => company.ordersUpdateOrderStatus(orderId, s.id('ready'))} alert={readyAllAlert} outline text pill mini>Mark All as Ready</Button>

													{:else}

														<Button action={() => company.ordersUpdateOrderStatus(orderId, s.id('fulfilled'))} outline text pill mini>Mark All as Fulfilled</Button>

													{/if}
												
												</div>
				
											{/if}

										</div>
									</td>
								</tr>

							{/if}

						{/each}

					{:else}

						{#each open as {createdDate, fulfilledCount, id:orderId, newCount, orderItems, show, user} (orderId)}

							{#if show}

								<tr class="order">
									<td rowspan={orderItems.length + 1}>
										<span class="date">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
									</td>
									<td colspan="5">
										<div>
											<div class="customer">
												<span class="phone-number">{user.phoneNumber}</span>
												<span class="name">{user.firstName} {user.lastName}</span>
											</div>
											<span class="order-status">{fulfilledCount} of {orderItems.length} Fulfilled</span>
										</div>
									</td>
								</tr>

								{#each orderItems as {distributorLocation, fulfillment, id, product, quantity, status:statusId} (id)}

									{@const status = s.name(statusId)}

									<tr class="item">
										<td>
											<span class="quantity">{quantity}</span>
										</td>
										<td>
											<span class="multiple">x</span>
										</td>
										<td>

											{#if distributorLocation}

												<span class="location">{$pL.find(l => l.id == distributorLocation.id)?.title}</span>

											{/if}

											<span class="title">{product.title}</span>
										</td>
										<td>
											<div>
												<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
												<span class="divide">|</span>
												<span class="item-status">{s.titleById(statusId)}</span>
											</div>
										</td>
										<td>
											<div>

												{#if status == 'new'}

													<div class="item-buttons">

														<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('ready'))} alert={readyAlert} pill mini>Mark as Ready</Button>

													</div>

												{:else if status == 'ready'}

													<!-- <div class="undo">

														<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('new'))} outline text pill mini>Undo</Button>

													</div> -->
													<div class="item-buttons">

														<Button action={() => company.ordersUpdateOrderItemStatus(orderId, id, s.id('fulfilled'))} pill mini>Mark as Fulfilled</Button>

													</div>

												{/if}

											</div>
										</td>
									</tr>

								{/each}

								<tr class="buttons">
									<td></td>
									<td colspan="5">
										<div>
											<div>

												<Button modal="company-order-details" data={{orderId, company, fetch}} outline text pill mini>View Details</Button>

											</div>
											
											{#if orderItems.length - fulfilledCount > 1}
											
												<div class="order-buttons">
											
													{#if newCount && newCount > 0}

														<Button action={() => company.ordersUpdateOrderStatus(orderId, s.id('ready'))} alert={readyAllAlert} outline text pill mini>Mark All as Ready</Button>

													{:else}

														<Button action={() => company.ordersUpdateOrderStatus(orderId, s.id('fulfilled'))} outline text pill mini>Mark All as Fulfilled</Button>

													{/if}

												</div>
												
											{/if}
									
										</div>
									</td>
								</tr>

							{/if}

						{/each}

					{/if}

				</tbody>
			</table>

		{:else}

			<span class="empty">No Open Orders</span>

		{/if}

		<div class="label-closed">
			<span>Fulfilled Orders</span>
			<div>
				<span>({#if searchActive}Search Results | {/if}{#if showAll}All {allCount}{:else}{recentCount}{#if moreOrders} Most Recent{:else} Total{/if}{/if}{#if filterFulfillmentMethod !== 'all' || filterOrderStatus !== 'all'} | Filtered{/if})</span>
				
				{#if moreOrders}
				
					<span><Button action={fetchAll} role="link" inverse>Show {#if showAll}Most Recent {recentCount}{:else}All {closedTotal}{/if}</Button></span>
				
				{/if}

			</div>
		</div>

		{#if hasClosed}

			{#if closed.length > 0}

				<table class={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}>
					<tbody>

						{#if isMobile}

							{#each closed as {createdDate, id:orderId, orderItems, show, user} (orderId)}

								{#if show}

									<tr class="order fulfilled">
										<td>
											<div>
												<span class="date fulfilled">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
												<span class="customer">{user.firstName} {user.lastName}</span>
												<span class="order-status fulfilled">Fulfilled</span>
											</div>
										</td>
									</tr>

									{#each orderItems as {fulfillment, product, quantity} (product)}

										<tr class="item fulfilled">
											<td>
												<div>
													<div>
														<span class="quantity">{quantity}</span>
														<span class="multiple">x</span>
														<span class="title">{product.title}</span>
														<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
													</div>
												</div>
											</td>
										</tr>

									{/each}

									<tr class="buttons fulfilled">
										<td>
											<div>
												<div>

													<Button modal="company-order-details" data={{orderId, company:null, fetch:null}} outline text pill mini>Details</Button>

												</div>
											</div>
										</td>
									</tr>

								{/if}

							{/each}

						{:else if isTablet}

							{#each closed as {createdDate, id:orderId, orderItems, show, user} (orderId)}

								{#if show}

									<tr class="order fulfilled">
										<td colspan="5">
											<div>
												<span class="date fulfilled">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
												<span class="customer fulfilled">{user.firstName} {user.lastName}</span>
												<span class="order-status fulfilled">Fulfilled</span>
											</div>
										</td>
									</tr>

									{#each orderItems as {fulfillment, product, quantity} (product)}

										<tr class="item fulfilled">

											<td>
												<span class="quantity">{quantity}</span>
											</td>
											<td>
												<span class="multiple">x</span>
											</td>
											<td colspan="3">
												<div>
													<span class="title fulfilled">{product.title}</span>
													<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
												</div>
											</td>
										</tr>

									{/each}

									<tr class="buttons fulfilled">
										<td colspan="5">
											<div>
												<div>

													<Button modal="company-order-details" data={{orderId, company:null, fetch:null}} outline text pill mini>View Details</Button>

												</div>
											</div>
										</td>
									</tr>

								{/if}

							{/each}

						{:else}

							{#each closed as {createdDate, id:orderId, orderItems, show, user} (orderId)}

								{#if show}

									<tr class="order fulfilled">
										<td rowspan={orderItems.length + 1}>
											<span class="date fulfilled">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
										</td>
										<td colspan="5">
											<div>
												<span class="customer fulfilled">{user.firstName} {user.lastName}</span>
												<span class="order-status fulfilled">Fulfilled</span>
											</div>
										</td>
									</tr>

									{#each orderItems as {fulfillment, product, quantity} (product)}

										<tr class="item fulfilled">

											<td>
												<span class="quantity">{quantity}</span>
											</td>
											<td>
												<span class="multiple">x</span>
											</td>
											<td colspan="3">
												<div>
													<span class="title fulfilled">{product.title}</span>
													<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
												</div>
											</td>
										</tr>

									{/each}

									<tr class="buttons fulfilled">
										<td></td>
										<td colspan="5">
											<div>
												<div>

													<Button modal="company-order-details" data={{orderId, company:null, fetch:null}} outline text pill mini>View Details</Button>

												</div>
											</div>
										</td>
									</tr>

								{/if}

							{/each}

						{/if}

					</tbody>
				</table>

			{:else if showAll && all.length == 0}

				<div class="empty">Loading...</div>

			{/if}

			{#if moreOrders}
				
				<div class="show-all"><Button action={fetchAll} role="link" inverse>Show {#if showAll}Fewer{:else}More{/if} Fulfilled Orders</Button></div>
			
			{/if}

		{:else}

			<span class="empty">No Fulfilled Orders</span>

		{/if}

	{:else if (!hasOpen && !hasClosed) && searchActive == true}

		{#if searchActive}

			<div class="empty">Your search returned no restuls.</div>

		{:else}

			<div class="empty">You have not yet received any orders.</div>

		{/if}

	{:else}

		<div class="empty">Loading...</div>

	{/if}

</div>



<style lang="sass">

	.orders-by-order-wrapper
		@include flex-col(1rem)

		.label-open,
		.label-closed
			padding-bottom: 2rem
			font-size: 2rem
			font-weight: 600
			@include flex-col(.5rem)

			> div

				span
					font-size: 1.25rem
					color: var(--cm-text-secondary-dark)

		.label-closed
			padding-top: 4rem

		.show-all
			text-align: center

		.empty
			padding-top: 2rem
			font-size: 1.5rem
			text-align: center

		table

			div,
			span
				display: inline-block
				width: max-content
				line-height: normal

			tr

				&.order

					td
						border-color: var(--cm-text-secondary)

				&.fulfilled

					td
						color: var(--cm-text-secondary)

				&.item:hover

					td
						background-color: var(--cm-utility-highlight)

			&.mobile
				table-layout: fixed

				tr

					&.order

						td
							padding: .5rem 0

							> div
								width: 100%
								@include flex-row-middle(.5rem)

								span:first-child
									flex-grow: 0

								span:last-child
									flex-grow: 0

					&.order:not(:nth-child(2))

						td
							padding-top: 4rem

						&:is(.fulfilled, :first-child)
							
							td
								padding-top: 0

					&.item

						td
							padding: 1rem

							> div
								width: 100%
								@include flex-col(.5rem)

								> div:nth-child(2)									
									width: 100%
									@include flex-row-middle-left(.25rem)

								> div:last-child									
									width: 100%
									@include flex-row-middle-between

									> div:last-child
										@include flex-row-middle-right(.5rem)

							.title
								flex-grow: 1 !important

							.fulfillment
								flex-grow: 0 !important

						&.fulfilled

							td

								> div
									
									> div
										@include flex-row-middle-left(.25rem)

										span:last-child
											flex-grow: 1
											padding-left: .25rem
											text-align: right

					&.buttons

						td
							padding-left: .5rem
							border-color: transparent

							> div								
								width: 100%
								@include flex-row-middle-between

			&.tablet

				tr

					&.order

						td
							padding-left: 0
							padding-right: 0

							> div								
								width: 100%
								@include flex-row-middle-between(.5rem)

								span:first-child
									flex-grow: 0

								span:last-child
									flex-grow: 0

					&.order:not(:nth-child(2))

						td
							padding-top: 2.5rem

						&:is(.fulfilled, :first-child)
							
							td
								padding-top: 0

					&.item

						td:first-child
							width: 1%
							padding-right: .25rem

						td:nth-child(2)
							width: 1%
							padding-right: 0
							padding-left: 0

						td:nth-child(3)
							padding-left: .25rem
							padding-right: .5rem

						td:nth-child(4)
							padding-left: 0
							padding-right: 0
							text-align: center

							span:first-child
								width: 66px
								text-align: right

							span:last-child
								width: 46px
								text-align: left

						td:nth-child(5)
							padding-left: .5rem
							text-align: right

							> div								
								width: 100%
								@include flex-row-right(.5rem)

						&.fulfilled

							td:last-child
								text-align: left

								> div									
									width: 100%
									@include flex-row-middle-between(.5rem)

									span:last-child
										flex-grow: 0

					&.buttons

						td
							padding-left: .5rem
							// padding-right: .5rem
							border-color: transparent

							> div								
								width: 100%
								@include flex-row-middle-between

			&.desktop

				tr

					&.order

						td:first-child
							width: 1%
							padding-left: 0
							padding-right: .5rem
							border-color: transparent
							vertical-align: top

						td:nth-child(2)
							padding-left: 0

						td:nth-child(3)
							padding-left: 0
							padding-right: 0

						td:last-child
							padding-right: 0
								
							> div								
								width: 100%
								@include flex-row-middle-between(.5rem)

					&.order:not(:nth-child(2))

						td
							padding-top: 3rem

						&:is(.fulfilled, :first-child)
							
							td
								padding-top: 0

					&.item

						td:first-child
							width: 1%
							padding-right: .25rem

						td:nth-child(2)
							width: 1%
							padding-right: 0
							padding-left: 0

						td:nth-child(3)
							padding-left: .25rem

						td:nth-child(4)
							padding-left: 0
							padding-right: 0

							span:first-child
								width: 84px
								text-align: right

							span:last-child
								width: 60px
								text-align: left

						td:last-child
							text-align: right

							> div								
								width: 100%
								@include flex-row-right(.5rem)

						&.fulfilled

							td:last-child
								text-align: left

								> div
									@include flex-row-middle-between(.5rem)

					&.buttons

						td
							padding-left: .5rem
							border-color: transparent

							> div								
								width: 100%
								@include flex-row-middle-between
						

			.date
				width: max-content
				min-width: max-content
				font-size: 1.5rem
				font-weight: 600

				&.fulfilled
					color: var(--cm-text-money)

			.customer
				width: 100%
				white-space: nowrap
				overflow: hidden
				text-overflow: ellipsis
				font-size: 1.25rem

				> span
					display: block

				.name
					font-weight: 600

				.phone-number
					font-size: .8em

			.order-status
				width: max-content
				min-width: max-content
				font-weight: 600

				&.fulfilled
					font-size: 1.25rem
					color: var(--cm-text-money)

			.order-buttons
				display: inline-block
				width: 170px

			.location
				color: var(--cm-primary)

			.title
				width: 100%
				white-space: nowrap
				overflow: hidden
				text-overflow: ellipsis
				font-weight: 600

			.item-buttons
				width: 170px

	@media (min-width: #{breakpoint('md')})

		.orders-by-order-wrapper

			table

				.date
					width: 70px
					min-width: 70px

				.customer
					max-width: 508px
					font-size: 1.5rem

					&.fulfilled
						max-width: 533px

				.order-buttons
					width: 150px

				.title
					max-width: 298px
					font-weight: 400

					&.fulfilled
						max-width: 564px

				.item-buttons
					width: 150px

	@media (min-width: #{breakpoint('lg')})

		.orders-by-order-wrapper

			table

				.date
					width: max-content
					min-width: max-content

				.customer
					max-width: 716px

					&.fulfilled
						max-width: 750px

					> span
						display: inline

				.order-buttons
					width: 190px

				.title
					max-width: 328px

					&.fulfilled
						max-width: 686px

				.item-buttons
					width: 190px

	@media (min-width: #{breakpoint('xl')})

		.orders-by-order-wrapper

			table

				.customer
					max-width: 966px

					&.fulfilled
						max-width: 1000px

				.title
					max-width: 578px

					&.fulfilled
						max-width: 936px

	@media (min-width: #{breakpoint('xxl')})

		.orders-by-order-wrapper

			table

				.customer
					max-width: 1216px

					&.fulfilled
						max-width: 1250px

				.title
					max-width: 828px

					&.fulfilled
						max-width: 1186px

</style>