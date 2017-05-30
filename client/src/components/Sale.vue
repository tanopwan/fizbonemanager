<template>
	<div>
		<div>
			<div class="block full">
				<div class="row">
					<div class="col-xs-12 col-sm-6 col-md-4">
						<div class="form-group">
							<div class="input-group">
								<span class="input-group-addon">Custom Date</span>
								<input type="text" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="dd-mm-yyyy">
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12">
						<div class="form-group">
							<label>Filter Products</label>
							<multi-select :options="products" placeholder="Filter by Products"></multi-select>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-xs-12">
						<div class="form-group">
							<label>Filter Promotions</label>
							<multi-select :options="promotionGroups" placeholder="Filter by Promotions"></multi-select>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<sale-promotion v-for="(promotion, index) in activePromotions" :index="index" :batchStocks="batchStocks" :promotion="promotion" :isConsignment="false" :onAddSale="onAddSale" :customers="customers">
					{{ promotion }}
				</sale-promotion>
			</div>
		</div>
		<div class="block full">
			<div class="block-title">
				<h4>
					All Sales <small> Total: {{ sales.length }}</small>
				</h4>
			</div>
			<table class="table table-striped table-borderless table-vcenter">
				<thead>
					<tr>
						<th class="text-center">Date</th>
						<th class="text-center">Product / Promotion</th>
						<th class="text-center">Quantity<br><span class="label label-info">Sum: {{ sumQuantity }}</span></th>
						<th class="text-center">Price (&#x0E3F;)</th>
						<th class="text-center">Total (&#x0E3F;)<br><span class="label label-info">Sum: {{ sumTotal }}</span></th>
						<th class="text-center">Customer</th>
						<th class="text-center hidden-sm hidden-xs">Description</th>
						<th class="text-center hidden-sm hidden-xs">Manage</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="sale in computedSales">
						<td class="text-center">{{ sale.stringDate }}</td>
						<td>{{ sale.product ? sale.product.name : '' }} / {{ sale.promotionName }}</td>
						<td class="text-center">{{ sale.quantity }}</td>
						<td class="text-center">{{ (sale.price).toFixed(2) }}</td>
						<td class="text-center">{{ (sale.total).toFixed(2) }}</td>
						<td class="text-center">
							<button v-if="sale.customer ? sale.customer.type==='FacebookOnline' : false" class="btn btn-info" :alt="sale.customer ? sale.customer.userRefId : ''"><i class="fa fa-facebook"></i></button>
							{{ sale.customer ? sale.customer.name : '' }}
						</td>
						<td class="hidden-sm hidden-xs">{{ sale.description }}</td>
						<td class="text-center hidden-sm hidden-xs">
							<button class="btn btn-danger" @click="deleteSale(sale._id)"><i class="fa fa-minus"></i></button>
						</td>
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
import Select2 from './basic/Select2.vue'
import MultiSelect from './basic/MultiSelect.vue'
import Vue from 'vue';

export default {
	data() {
		return {
			description: '',
			sales: [],
			batchStocks: [],
			promotions: [],
			customers: [],
			sumQuantity: 0,
			sumTotal: 0,
			productFilters: [],
			products: [],
			promotionGroups: []
		};
	},
	computed: {
		computedSales: function() {
			this.sumQuantity = 0;
			this.sumTotal = 0;
			this.sales.forEach(sale => {
				sale.promotionName = sale.promotion.name;
				sale.price = sale.promotion.price / 100;
				sale.total = sale.promotion.price * sale.quantity / 100;
				sale.stringDate = moment(sale.saleDate).format('LLL');
				this.sumQuantity += sale.quantity;
				this.sumTotal += sale.total;
			})

			return this.sales.sort(function(s1, s2){
				let isAfter = moment(s1.createdAt).isAfter(s2.createdAt);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
		},
		activePromotions: function() {
			if (this.promotions) {
				return this.promotions.filter(promotion => {
					if (promotion.isActive === false || promotion.group === 'Consignment') {
						return false;
					}
					return true;
				});
			}
			return [];
		}
	},
	methods: {
		deleteSale(id) {
			this.$http.delete('/api/sales/' + id).then(response => {
				let index = -1;
				this.sales.forEach((sale, idx) => {
					if (sale._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.sales.splice(index, 1);
					this.updateStock();
				}
			}, response => {
				console.log(response);
			});
		},
		onAddSale(sale) {
			this.sales.push(sale);
			this.updateStock();
		},
		updateStock() {
			EventBus.getBatchStock()
			.then(response => this.batchStocks = response.body)
			.catch(response => console.log(response));
		}
	},
	created() {
		this.$http.get('/api/sales?consignment=false&limit=10')
		.then(response => this.sales = response.body)
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

				if (this.products.indexOf(promotion.batchId.product.name) < 0) {
					this.products.push(promotion.batchId.product.name);
				}

				if (this.promotionGroups.indexOf(promotion.group) < 0) {
					this.promotionGroups.push(promotion.group);
				}

				Vue.set(this.promotions[idx], 'batches', batches);
			});
			console.log(this.products);
			console.log(this.promotionGroups);
		})
		.catch(response => console.log(response));
		EventBus.getCustomers()
		.then(response => this.customers = response.body)
		.catch(response => console.log(response));
		this.updateStock();
	},
	components: {
		salePromotion,
		select2: Select2,
		multiSelect: MultiSelect
	}
}
</script>
