<template>
	<div>
		<div id="modal-regular" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title"><strong>Bill</strong></h3>
					</div>
					<div class="modal-body">
						<div class="row form-group">
							<div class="col-sm-6">
								<div class="input-group">
									<span class="input-group-addon">จำนวน</span>
									<input type="text" v-model="billQuantity" class="form-control" placeholder="จำนวน">
								</div>
							</div>
							<div class="col-sm-6">
								<div class="input-group">
									<span class="input-group-addon">ราคา</span>
									<input type="text" v-model="billPrice" class="form-control" placeholder="ราคา">
								</div>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" @click="bill" class="btn btn-effect-ripple btn-success" data-dismiss="modal" style="overflow: hidden; position: relative;">Save</button>
						<button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div>
			<div class="block full">
				<div class="row">
					<div class="col-xs-12 col-sm-6 col-md-4">
						<div class="input-group">
							<span class="input-group-addon">Custom Date</span>
							<input type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="dd-mm-yyyy">
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<sale-promotion v-for="(promotion, index) in activePromotions" :index="index" :batchStocks="batchStocks" :promotion="promotion" :isConsignment="true" :onAddSale="onAddSale" :customers="customers"></sale-promotion>
			</div>
		</div>
		<div class="block full">
			<div class="block-title">
				<h4>
					All Consignment <small> Total: {{ consignments.length }}</small>
				</h4>
			</div>
			<table class="table table-striped table-borderless table-vcenter">
				<thead>
					<tr>
						<th class="text-center">Date</th>
						<th class="text-center hidden-sm hidden-xs">Customer</th>
						<th class="text-center">Quantity</th>
						<th class="text-center">Price (&#x0E3F;)</th>
						<th class="text-center">Total (&#x0E3F;)</th>
						<th class="text-center hidden-sm hidden-xs">Description</th>
						<th class="text-center">Manage</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="consignment in computedConsignments">
						<td class="text-center">{{ consignment.stringDate }}</td>
						<td class="hidden-sm hidden-xs">{{ consignment.customerName }}</td>
						<th class="text-center">{{ consignment.bill ? consignment.bill.quantity : 0 }} / {{ consignment.quantity }}</th>
						<th class="text-center">{{ consignment.price }}</th>
						<th class="text-center">{{ consignment.total }}</th>
						<td class="hidden-sm hidden-xs">{{ consignment.description }}</td>
						<th class="text-center">
							<a v-if="!consignment.bill || consignment.bill.quantity !== consignment.quantity" href="#modal-regular" @click="billConsignment(consignment._id)" class="btn btn-warning" data-toggle="modal" style="overflow: hidden; position: relative;">
								<i class="fa fa-money"></i>
							</a>
							<button class="btn btn-danger" @click="deleteConsignment(consignment._id)"><i class="fa fa-minus"></i></button>
						</th>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
import moment from 'moment';
import { EventBus } from '../bus';
import salePromotion from './SalePromotion.vue';
import Select2 from './basic/Select2.vue';
import Vue from 'vue';

export default {
	data() {
		return {
			description: '',
			consignments: [],
			batchStocks: [],
			promotions: [],
			customers: [],
			billQuantity: 0,
			billPrice: 0,
			currentConsignment: {}
		};
	},
	computed: {
		computedConsignments: function() {
			this.consignments.forEach(consignment => {
				consignment.promotionName = consignment.promotion.name;
				consignment.price = consignment.promotion.price / 100;
				consignment.total = consignment.promotion.price * consignment.quantity / 100;
				consignment.stringDate = moment(consignment.saleDate).format('LLL');
				consignment.customerName = consignment.customer ? consignment.customer.name : 'ทั่วไป';
			})

			return this.consignments.sort(function(s1, s2){
				let isAfter = moment(s1.saleDate).isAfter(s2.saleDate);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
		},
		activePromotions: function() {
			if (this.promotions) {
				return this.promotions.filter(promotion => {
					if (promotion.isActive === false || promotion.isBilled === true) {
						return false;
					}
					return true;
				});
			}
			return [];
		}
	},
	methods: {
		bill() {
			if (this.billQuantity <= 0 || this.billQuantity > this.currentConsignment.quantity) {
				console.log("invalid quantity");
				return;
			}

			console.log(this.billQuantity);
			this.$http.post(`/api/sales/bill/${this.currentConsignment._id}`, {
				quantity: this.billQuantity,
				price: this.billPrice
			}).then(response => {
				console.log(response);
			}).catch(response => console.log(response));
		},
		billConsignment(id) {
			this.currentConsignment = this.consignments.find(consignment => consignment._id === id);
			this.billQuantity = this.currentConsignment.quantity - (this.currentConsignment.bill ? this.currentConsignment.bill.quantity : 0);
			this.billPrice = this.currentConsignment.price;
		},
		deleteConsignment(id) {
			this.$http.delete('/api/sales/' + id).then(response => {
				let index = -1;
				this.consignments.forEach((consignment, idx) => {
					if (consignment._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.consignments.splice(index, 1);
					this.updateStock();
				}
			}, response => {
				console.log(response);
			});
		},
		onAddSale(sale) {
			this.consignments.push(sale);
			this.updateStock();
		},
		updateStock() {
			EventBus.getBatchStock()
			.then(response => this.batchStocks = response.body)
			.catch(response => console.log(response));
		}
	},
	created() {
		EventBus.getConsignments(10)
		.then(response => this.consignments = response.body)
		.catch(response => console.log(response));
		EventBus.getPromotions()
		.then(response => {
			this.promotions = response.body;
			return this.$http.get('/api/products/batches');
		})
		.then(response => {
			let productWithBatches = response.body;
			this.promotions.forEach((promotion, idx) => {
				let batches = productWithBatches.find(product => product.name === promotion.batchId.product.name).batches;
				Vue.set(this.promotions[idx], 'batches', batches);
			});
		})
		.catch(response => console.log(response));
		EventBus.getCustomers()
		.then(response => this.customers = response.body)
		.catch(response => console.log(response));
		this.updateStock();
	},
	components: {
		salePromotion,
		select2: Select2
	}
}
</script>
