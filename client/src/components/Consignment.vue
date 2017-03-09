<template>
	<div>
		<sale-promotion :addSale="addConsignment" :batchStocks="batchStocks" :promotions="promotions" :isConsignment="true"></sale-promotion>
		<div class="block full">
			<div class="block-title">
				<h4>
					All Consignment <small> Total: {{ consignments.length }}</small>
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
						<th class="text-center hidden-sm hidden-xs">Manage</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="consignment in computedConsignments">
						<td class="hidden-sm hidden-xs">{{ consignment.promotionName }}</td>
						<td class="text-center">{{ consignment.stringDate }}</td>
						<th class="text-center">{{ consignment.quantity }}</th>
						<th class="text-center">{{ consignment.price }}</th>
						<th class="text-center">{{ consignment.total }}</th>
						<td class="hidden-sm hidden-xs">{{ consignment.description }}</td>
						<th class="text-center hidden-sm hidden-xs">
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
import Select2 from './basic/Select2.vue'

export default {
	data() {
		return {
			description: '',
			consignments: [],
			batchStocks: [],
			promotions: []
		};
	},
	computed: {
		computedConsignments: function() {
			this.consignments.forEach(consignment => {
				consignment.promotionName = consignment.promotionId.name;
				consignment.price = consignment.promotionId.price / 100;
				consignment.total = consignment.promotionId.price * consignment.quantity / 100;
				consignment.stringDate = moment(consignment.consignmentDate).format('LLL');
			})

			return this.consignments.sort(function(s1, s2){
				let isAfter = moment(s1.consignmentDate).isAfter(s2.consignmentDate);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
		}
	},
	methods: {
		deleteConsignment(id) {
			this.$http.delete('/api/consignments/' + id).then(response => {
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
		addConsignment(data) {
			EventBus.addConsignment(data).then(response => {
				this.consignments.push(response.body);
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
		EventBus.getConsignments(10)
			.then(response => this.consignments = response.body)
			.catch(response => console.log(response));
		EventBus.getPromotions()
			.then(response => this.promotions = response.body)
			.catch(response => console.log(response));
		this.updateStock();
	},
	components: {
		salePromotion,
		select2: Select2
	}
}
</script>
