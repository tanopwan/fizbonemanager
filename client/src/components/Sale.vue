<template>
	<div>
		<sale-promotion :addSale="addSale" :batchStocks="batchStocks" :promotions="promotions" :isConsignment="false" :customers="customers"></sale-promotion>
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
						<th class="text-center">Quantity<br><span class="label label-info">Sum: {{ sumQuantity }}</span></th>
						<th class="text-center">Price (&#x0E3F;)</th>
						<th class="text-center">Total (&#x0E3F;)<br><span class="label label-info">Sum: {{ sumTotal }}</span></th>
						<th class="text-center hidden-sm hidden-xs">Description</th>
						<th class="text-center hidden-sm hidden-xs">Manage</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="sale in computedSales">
						<td class="hidden-sm hidden-xs">{{ sale.promotionName }}</td>
						<td class="text-center">{{ sale.stringDate }}</td>
						<td class="text-center">{{ sale.quantity }}</td>
						<td class="text-center">{{ sale.price }}</td>
						<td class="text-center">{{ sale.total }}</td>
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

export default {
	data() {
		return {
			description: '',
			sales: [],
			batchStocks: [],
			promotions: [],
			customers: [],
			sumQuantity: 0,
			sumTotal: 0
		};
	},
	computed: {
		computedSales: function() {
			this.sumQuantity = 0;
			this.sumTotal = 0;
			this.sales.forEach(sale => {
				sale.promotionName = sale.promotionId.name;
				sale.price = sale.promotionId.price / 100;
				sale.total = sale.promotionId.price * sale.quantity / 100;
				sale.stringDate = moment(sale.saleDate).format('LLL');
				this.sumQuantity += sale.quantity;
				this.sumTotal += sale.total;
			})

			return this.sales.sort(function(s1, s2){
				let isAfter = moment(s1.saleDate).isAfter(s2.saleDate);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
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
		addSale(data) {
			EventBus.addSale(data).then(response => {
				this.sales.push(response.body);
				this.updateStock();
			})
			.catch(response => console.log(response));
		},
		updateStock() {
			EventBus.getBatchStock()
				.then(response => this.batchStocks = response.body)
				.catch(response => console.log(response));
		}
	},
	created() {
		EventBus.getSales(10)
			.then(response => this.sales = response.body)
			.catch(response => console.log(response));
		EventBus.getPromotions()
			.then(response => this.promotions = response.body)
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
