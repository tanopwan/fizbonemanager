<template>
	<div>
		<order-widget></order-widget>
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
		<div v-show="showOrder">
			<div class="block full">
				<div class="block-title">
					<ul class="nav nav-tabs">
						<li class="active"><a @click="viewOrder={}">Back</a></li>
					</ul>
				</div>
				<div class="block-section">
					<div class="row">
						<div class="col-md-3">
							<ul class="nav nav-pills nav-stacked" data-toggle="tabs">
								<li class="active">
									<a href="#tabs-detail"><i class="fa fa-fw fa-tasks icon-push"></i> Detail</a>
								</li>
								<li>
									<a href="#tabs-payment"><span class="badge pull-right">!</span><i class="fa fa-fw fa-credit-card icon-push"></i> Payment</a>
								</li>
								<li>
									<a href="#tabs-shipping"><i class="fa fa-fw fa-paper-plane-o icon-push"></i> Shipping</a>
								</li>
							</ul>
						</div>
						<div class="col-md-9 tab-content">
							<div id="tabs-detail" class="tab-pane active">
								<h4 class="sub-header">
									Order <small> {{ viewOrder._id }}</small>
								</h4>
								<table class="table table-striped table-borderless table-vcenter">
									<tbody>
										<tr class="info">
											<td colspan="3">
												<h4>
													<button v-if="viewOrder.customer ? viewOrder.customer.type==='FacebookOnline' : false" class="btn btn-info"><i class="fa fa-facebook"></i></button>
													 {{ viewOrder.customer ? viewOrder.customer.name : '' }} <small>(refUserId: {{ viewOrder.customer ? viewOrder.customer.refUserId : '' }})</small>
												</h4>
											</td>
											<td colspan="2">Date: {{ viewOrder.saleDate }}</td>
										</tr>
										<tr class="primary">
											<td colspan="3">
												<h4>จัดส่ง {{ viewOrder.address.name }}</h4>
												<p>
													{{ viewOrder.address.street }}<br>
													{{ viewOrder.address.subDistrict }}<span v-if="viewOrder.address.district">, {{ viewOrder.address.district }}</span><br>
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
												{{ item.product.name }} / {{ item.batch ? item.batch.batchRef : '' }}
											</td>
											<td class="text-right">
												&#x0E3F; {{ (item.promotion.price / 100).toFixed(2) }}
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
										<tr v-if="viewOrder.shippingFee">
											<td colspan="4">Shipping Fee</td>
											<td class="text-right text-info">
												<strong>&#x0E3F; {{ (viewOrder.shippingFee / 100).toFixed(2) }}</strong>
											</td>
										</tr>
										<tr class="success">
											<td colspan="4">Total</td>
											<td class="text-right">
												<strong>&#x0E3F; {{ ((viewOrder.subTotal + (viewOrder.shippingFee ? viewOrder.shippingFee : 0)) / 100).toFixed(2) }}</strong>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div id="tabs-payment" class="tab-pane">
								<h4 class="sub-header">Payment</h4>
								<div class="block full">
									<div class="text-center">
										<a href="#modal-small" class="btn btn-effect-ripple btn-danger" data-toggle="modal" style="overflow: hidden; position: relative;">
											<i class="fa fa-check"></i> Verified
										</a>
									</div><br>
									<img v-for="attachment in (viewOrder.payment ? viewOrder.payment.attachments : [])" :src="attachment" class="img-responsive center-block" style="max-width: 500px;">
								</div>
							</div>
							<div id="tabs-shipping" class="tab-pane">
								<h4 class="sub-header">Shipping</h4>
								<div class="row">
									<div class="col-xs-6">
										<div class="form-group">
											<div class="input-group">
												<span class="input-group-addon">Drop-off Date</span>
												<input type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" v-model="dropoffDate">
											</div>
										</div>
									</div>
									<div class="col-xs-6">
										<div class="form-group">
											<div class="input-group bootstrap-timepicker">
												<div class="bootstrap-timepicker-widget dropdown-menu">
													<table>
														<tbody>
															<tr>
																<td><a href="#" data-action="incrementHour"><i class="fa fa-chevron-up"></i></a></td>
																<td class="separator">&nbsp;</td>
																<td><a href="#" data-action="incrementMinute"><i class="fa fa-chevron-up"></i></a></td>
																<td class="separator">&nbsp;</td>
																<td><a href="#" data-action="incrementSecond"><i class="fa fa-chevron-up"></i></a></td>
															</tr>
															<tr>
																<td><input type="text" class="form-control bootstrap-timepicker-hour" maxlength="2"></td>
																<td class="separator">:</td>
																<td><input type="text" class="form-control bootstrap-timepicker-minute" maxlength="2"></td>
																<td class="separator">:</td>
																<td><input type="text" class="form-control bootstrap-timepicker-second" maxlength="2"></td>
															</tr>
															<tr>
																<td><a href="#" data-action="decrementHour"><i class="fa fa-chevron-down"></i></a></td>
																<td class="separator"></td>
																<td><a href="#" data-action="decrementMinute"><i class="fa fa-chevron-down"></i></a></td>
																<td class="separator">&nbsp;</td>
																<td><a href="#" data-action="decrementSecond"><i class="fa fa-chevron-down"></i></a></td>
															</tr>
														</tbody>
													</table>
												</div>
												<input type="text" class="form-control input-timepicker24" v-model="dropoffTime">
												<span class="input-group-btn">
													<a href="javascript:void(0)" class="btn btn-effect-ripple btn-primary" style="overflow: hidden; position: relative;"><span class="btn-ripple animate" style="height: 38px; width: 38px; top: -1px; left: 4.75px;"></span><i class="fa fa-clock-o"></i></a>
												</span>
											</div>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-xs-12 form-inline">
										<div class="form-group">
											<div class="input-group">
												<select2 :options="shippingOptions" v-model="selectedShipping" allowClear="false">
												</select2>
											</div>
										</div>
										<div class="form-group" :class="{ 'has-error': trackingNoError }">
											<div class="input-group">
												<span class="input-group-addon">{{ selectedShipping }}</span>
												<input type="text" class="form-control" v-model="trackingNo">
												<span class="input-group-addon">TH</span>
											</div>
										</div>
										<div class="form-group">
											<button type="submit" @click="setTrackingNo" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Submit</button>
											<button type="submit" class="btn btn-effect-ripple btn-info" style="overflow: hidden; position: relative;">Resend Notification</button>
										</div>
									</div>
								</div>
								<h4 class="sub-header">Detail</h4>
								<div class="row">
									<div class="col-xs-6">
										<div class="alert alert-info alert-dismissable">
											<h4><strong>Shipping Information</strong></h4>
											<p>{{ viewOrder.shipping ? viewOrder.shipping.trackingNo : '' }}</p>
											@ {{ viewDropoffDateTime }}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div v-show="!showOrder" class="block full">
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
							<a @click="setOrder(order._id)">{{ order._id }}</a>
						</td>
						<td class="text-center">{{ order.customer ? order.customer.name : 'NA' }}</td>
						<td class="text-center">{{ order.noItems }}</td>
						<td class="text-center">{{ (order.total / 100).toFixed(2) }}</td>
						<td class="text-center">{{ order.payment ? order.payment.status : 0 }}</td>
						<td class="text-center">
							{{ order.shipping ? order.shipping.status: 0 }}
							<button v-if="order.shipping && order.shipping.status==='WAIT_VERIFIED'" class="btn btn-danger"><i class="fa fa-exclamation-circle"></i></button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
import moment from 'moment';
import Select2 from './basic/Select2.vue';
import OrderWidget from './OrderWidget.vue'

export default {
	data() {
		return {
			orders: [],
			showOrder: false,
			viewOrder: {
				customer: {},
				address: {},
				items: [],
				payment: {}
			},
			viewDropoffDateTime: '',
			dropoffDate: moment(new Date()).format("YYYY-MM-DD"),
			dropoffTime: moment(new Date()).format("HH:mm"),
			trackingNoError: false,
			trackingNo: '',
			selectedShipping: 'ER',
			shippingOptions: [{ id: 'ER', text: 'EMS' }, { id: 'RL', text: 'RL' }]
		};
	},
	methods: {
		verify() {
			this.$http.post('api/sales/order/' + this.viewOrder._id).then(response => {
				let updatedOrder = response.body;
				this.orders.forEach((order) => {
					if (order._id === updatedOrder._id) {
						order.payment = updatedOrder.payment;
					}
				});
			}).catch(response => console.log(response));
		},
		setOrder(orderId) {
			this.$http.get('/api/sales/orders/' + orderId).then(order => {
				this.viewOrder = Object.assign({
					customer: {},
					address: {},
					items: [],
					payment: {}
				}, order.body);
				this.showOrder = true;
				this.viewOrder.items.forEach(item => {

					item.total = item.promotion.price * item.quantity;
				});
				this.viewOrder.subTotal = this.viewOrder.items.reduce((a, b) => {
					return { total: a.total + b.total };

				}, { total: 0 }).total;
			});
		},
		setTrackingNo() {
			let dropoffDateTime = moment(`${this.dropoffDate} ${this.dropoffTime}`, "YYYY-MM-DD HH:mm");
			if (this.trackingNo.length === 9 && /^\d+$/.test(this.trackingNo)) {
				this.trackingNoError = false;
				this.$http.post(`/api/sales/order/${this.viewOrder._id}/tracking`, {
					trackingNo: this.selectedShipping + this.trackingNo + 'TH',
					type: this.selectedShipping,
					dropoffDateTime: dropoffDateTime
				}).then(response => {
					this.viewOrder = response.body;
					this.trackingNo = '';
					this.selectedShipping = 'ER';
					this.dropoffDate = moment(new Date()).format("YYYY-MM-DD");
					this.dropoffTime = moment(new Date()).format("HH:mm");
				}).catch(response => console.log(response));
			}
			else {
				this.trackingNoError = true;
			}
		}
	},
	watch: {
		'viewOrder.shipping.dropoffDateTime': function(val) {
			this.viewDropoffDateTime = moment(new Date(val)).format('YYYY-MM-DD HH:mm');
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
					trackingNo\
					dropoffDateTime\
				}\
				customer {\
					name\
					type\
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
	},
	mounted() {
		let vm = this;
		$('[data-toggle="tabs"] a, .enable-tabs a').click( function(e){
			e.preventDefault();
			$(this).tab('show');
		});
		$('.input-datepicker').datepicker().on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.dropoffDate = $(this).val();
		});
		$('.input-timepicker24').timepicker({
			minuteStep: 1,
			//showSeconds: true,
			showMeridian: false
		}).on('changeTime.timepicker', function(e) {
			vm.dropoffTime = e.time.value;
		})
	},
	components: {
		select2: Select2,
		orderWidget: OrderWidget,
	}
}
</script>
