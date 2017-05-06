<template>
	<div>
		<div id="modal-small" class="modal" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">
			<div class="modal-dialog modal-sm">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title"><strong>Are you sure?</strong></h3>
					</div>
					<div class="modal-body">
						หลังจากยืนยันแล้ว จะไม่สามารถแก้ไขได้ และจะส่งคำยืนยันให้ลูกค้าทันที
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-effect-ripple btn-default" data-dismiss="modal" style="overflow: hidden; position: relative;">Cancel</button>
						<button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" @click="verify" style="overflow: hidden; position: relative;">Verify</button>
					</div>
				</div>
			</div>
		</div>
		<div v-if="viewOrder" class="block full">
			<div class="block-title">
				<ul class="nav nav-tabs" data-toggle="tabs">
					<li class="active"><a @click="viewOrder=null">Back</a></li>
				</ul>
			</div>
			<h4>
				Order <small> {{ viewOrder._id }}</small>
			</h4>
			<table class="table table-striped table-borderless table-vcenter">
				<tbody>
					<tr class="info">
						<td colspan="3">
							<h4>Customer: {{ viewOrder.customer.name }} <small>({{ viewOrder.customer.refUserId }})</small></h4>
						</td>
						<td colspan="2">Date: {{ viewOrder.stringDate }}</td>
					</tr>
					<tr class="primary">
						<td colspan="3">
							<h4>จัดส่ง {{ viewOrder.address.name }}</h4>
							<p>
								{{ viewOrder.address.street }}<br>
								{{ viewOrder.address.subDistrict }}, {{ viewOrder.address.district }}<br>
								{{ viewOrder.address.province }} {{ viewOrder.address.postalCode }}
							</p>
						</td>
						<td colspan="2"></td>
					</tr>
					<tr v-for="item in viewOrder.items">
						<td>
							<img :src="item.product.link" class="img-responsive center-block" style="max-width: 100px;">
						</td>
						<td>
							{{ item.product.name }} / {{ item.batch.batchRef }}
						</td>
						<td class="text-right">
							&#x0E3F; {{ (item.price / 100).toFixed(2) }} / unit
						</td>
						<td style="width: 60px;" class="text-center">
							{{ item.quantity }}
						</td>
						<td class="text-right">
							&#x0E3F; <strong>{{ (item.total / 100).toFixed(2) }}</strong>
						</td>
					</tr>
					<tr>
						<td colspan="4">Subtotal</td>
						<td class="text-right text-warning">
							<strong>&#x0E3F; {{ (viewOrder.subTotal / 100).toFixed(2) }}</strong>
						</td>
					</tr>
					<tr>
						<td colspan="4">Shipping Fee</td>
						<td class="text-right text-info">
							<strong>&#x0E3F; {{ (viewOrder.shippingFee / 100).toFixed(2) }}</strong>
						</td>
					</tr>
					<tr class="success">
						<td colspan="4">Total</td>
						<td class="text-right">
							<strong>&#x0E3F; {{ (viewOrder.total / 100).toFixed(2) }}</strong>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="block-section">
				<h4 class="sub-header">Payment</h4>
				<div class="block full">
					<div class="text-center">
						<a href="#modal-small" class="btn btn-effect-ripple btn-danger" data-toggle="modal" style="overflow: hidden; position: relative;">
							<i class="fa fa-check"></i> Verified
						</a>
					</div><br>
					<img v-for="attachment in viewOrder.payment.attachments" :src="attachment" class="img-responsive center-block" style="max-width: 500px;">
				</div>
			</div>
		</div>
		<div v-show="!viewOrder" class="block full">
			<div class="block-title">
				<h4>
					All Orders <small> Total: {{ orders.length }}</small>
				</h4>
			</div>
			<table class="table table-striped table-borderless table-vcenter">
				<thead>
					<tr>
						<th class="text-center">Date</th>
						<th class="text-center hidden-sm hidden-xs">OrderId</th>
						<th class="text-center">Customer<br>Name</th>
						<th class="text-center">Items</th>
						<th class="text-center">Total &#x0E3F;</th>
						<th class="text-center">Payment<br>Status</th>
						<th class="text-center">Shipping<br>Status</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(order, index) in computedOrders" :key="'row' + index">
						<td class="text-center">{{ order.stringDate }}</td>
						<td class="text-center hidden-sm hidden-xs">
							<a @click="viewOrder=order">{{ order._id }}</a>
						</td>
						<td class="text-center">{{ order.customer ? order.customer.name : 'NA' }}</td>
						<td class="text-center">{{ order.noItems }}</td>
						<td class="text-center">{{ (order.total / 100).toFixed(2) }}</td>
						<td class="text-center">{{ order.payment ? order.payment.status : 0 }}</td>
						<td class="text-center">
							{{ order.shipping ? order.shipping.status: 0 }}
							<button v-if="order.shipping.status==='WAIT_VERIFIED'" class="btn btn-danger"><i class="fa fa-exclamation-circle"></i></button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
import moment from 'moment';

export default {
	data() {
		return {
			orders: [],
			viewOrder: null
		};
	},
	methods: {
		verify() {
			console.log("verify");
		}
	},
	computed: {
		computedOrders: function() {
			this.orders.forEach(order => {
				order.stringDate = moment(new Date(order.createdAt)).format('LLL');
			})

			return this.orders.sort(function(s1, s2){
				let isAfter = moment(s1.createdAt).isAfter(s2.createdAt);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
		}
	},
	created() {
		this.$http.post('/graphql', { "query": "{\
			orders {\
				_id\
				createdAt\
				noItems\
				total\
				subTotal\
				shippingFee\
				payment {\
					status\
					attachments\
				}\
				shipping {\
					status\
				}\
				customer {\
					name\
					refUserId\
				}\
				items {\
					product {\
						name\
						link\
					}\
					quantity\
					price\
					total\
					batch {\
						batchRef\
					}\
				}\
				address {\
					name\
					street\
					subDistrict\
					district\
					province\
					postalCode\
				}\
			}\
		}"}).then(response => {
			this.orders = response.body.data.orders;
		}).catch(response => console.log(response));
	}
}
</script>
