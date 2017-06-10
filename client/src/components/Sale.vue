<template>
	<div>
		<sale-widget :onAddSale="onAddSale"></sale-widget>
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
import SaleWidget from './SaleWidget.vue';

export default {
	data() {
		return {
			sales: [],
			batchStocks: [],
			sumQuantity: 0,
			sumTotal: 0,

			selectedProduct: '',
			selectedBatch: '',
			selectedPromotion: '',
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
		this.$http.get('/api/sales?limit=10')
		.then(response => this.sales = response.body)
		.catch(response => console.log(response));
	},
	components: {
		saleWidget: SaleWidget
	}
}
</script>
