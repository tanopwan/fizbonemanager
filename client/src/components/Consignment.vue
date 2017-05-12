<template>
	<div>
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
						<th class="text-center">{{ consignment.quantity }}</th>
						<th class="text-center">{{ consignment.price }}</th>
						<th class="text-center">{{ consignment.total }}</th>
						<td class="hidden-sm hidden-xs">{{ consignment.description }}</td>
						<th class="text-center">
							<button class="btn btn-info" @click="billConsignment(consignment._id)"><i class="fa fa-money"></i></button>
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
			customers: []
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
		billConsignment(id, quantity) {

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
