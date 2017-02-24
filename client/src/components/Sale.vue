<template>
	<div>
		<div class="row">
			<sale-promotion :addSale="addSale" :batchStocks="batchStocks"></sale-promotion>
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
						<th class="text-center hidden-sm hidden-xs">Promotion</th>
						<th class="text-center">Date</th>
						<th class="text-center">Quantity</th>
						<th class="text-center">Price (&#x0E3F;)</th>
						<th class="text-center">Total (&#x0E3F;)</th>
						<th class="text-center hidden-sm hidden-xs">Description</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="sale in computedSales">
						<td class="hidden-sm hidden-xs">{{ sale.promotionName }}</td>
						<td class="text-center">{{ sale.stringDate }}</td>
						<th class="text-center">{{ sale.quantity }}</th>
						<th class="text-center">{{ sale.price }}</th>
						<th class="text-center">{{ sale.total }}</th>
						<td class="hidden-sm hidden-xs">{{ sale.description }}</td>
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

export default {
	data() {
		return {
			description: '',
			batches: [],
			sales: [],
			batchStocks: []
		};
	},
	computed: {
		computedSales: function() {
			this.sales.forEach(sale => {
				sale.promotionName = sale.promotionId.name;
				sale.price = sale.promotionId.price / 100;
				sale.total = sale.promotionId.price * sale.quantity / 100;
				sale.stringDate = moment(sale.saleDate).format('LLL');
			})
			this.sales.sort(function(s1, s2){
				let isAfter = moment(s1.saleDate).isAfter(s2.saleDate);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
			return this.sales;
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
				}
			}, response => {
				console.log(response);
			});
		},
		addSale(data) {
			EventBus.addSale(data).then(response => {
				this.sales.push(response.body);
				return EventBus.getBatchStock();
			})
			.then(response => this.batchStocks = response.body)
			.catch(response => console.log(response));
		}
	},
	created() {
		EventBus.getBatches()
			.then(response => this.batches = response.body)
			.catch(response => console.log(response));
		EventBus.getSales()
			.then(response => this.sales = response.body)
			.catch(response => console.log(response));
		EventBus.getBatchStock()
			.then(response => this.batchStocks = response.body)
			.catch(response => console.log(response));
	},
	components: {
		salePromotion
	}
}
</script>
