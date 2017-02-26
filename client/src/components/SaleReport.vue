<template>
	<div>
		<div class="block full">
			<div class="block-title">
				<h4>
					Search <small> ค้นหา...</small>
				</h4>
			</div>
			<form class="form-horizontal">
				<div class="row">
					<div class="col-xs-6">
						<div class="form-group">
							<label class="col-xs-3 control-label">Filter Promotion</label>
							<div class="col-xs-9">
								<select2 :options="promotionOptions" v-model="selectedFilterPromotion" placeholder="Filter Promotion...">
								</select2>
							</div>
						</div>
					</div>
					<div class="col-xs-6">
						<label class="col-xs-3 control-label">Filter Date</label>
						<ul class="pagination pagination-sm" style="margin-top: 3px;">
							<li :class="{ active : allFilter }"><a href="javascript:void(0)" @click="allClick">All</a></li>
							<li :class="{ active : todayFilter }"><a href="javascript:void(0)" @click="todayClick">Today</a></li>
							<li :class="{ active : thisWeekFilter }"><a href="javascript:void(0)" @click="thisWeekClick">7 days</a></li>
							<li :class="{ active : thisMonthFilter }"><a href="javascript:void(0)" @click="thisMonthClick">30 days</a></li>
						</ul>
					</div>
				</div>
			</form>
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
						<th class="text-center hidden-sm hidden-xs">Manage</th>
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
						<th class="text-center hidden-sm hidden-xs">
							<button class="btn btn-danger" @click="deleteSale(sale._id)"><i class="fa fa-minus"></i></button>
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
			batches: [],
			sales: [],
			allFilter: false,
			todayFilter: false,
			thisWeekFilter: false,
			thisMonthFilter: false,
			promotions: [],
			selectedFilterPromotion: ''
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

			return this.sales.sort(function(s1, s2){
				let isAfter = moment(s1.saleDate).isAfter(s2.saleDate);
				if (isAfter) {
					return -1;
				}
				return 1;
			}).filter(sale => {
				if (!this.selectedFilterPromotion || this.selectedFilterPromotion.length === 0) {
					return true; // All
				}
				return sale.promotionName === this.selectedFilterPromotion;
			}).filter(sale => {
				if (this.allFilter) {
					return true;
				} else if (this.todayFilter) {
					if (moment(sale.saleDate).isSame(new Date(), "day") &&
					moment(sale.saleDate).isSame(new Date(), "month") &&
					moment(sale.saleDate).isSame(new Date(), "year")) {
						return true;
					}
					return false;
				} else if (this.thisWeekFilter) {
					if (moment(sale.saleDate).isBetween(moment().subtract(6, 'days').startOf('day'), moment().endOf('day'))) {
						return true;
					}
					return false;
				} else if (this.thisMonthFilter) {
					if (moment(sale.saleDate).isBetween(moment().subtract(30, 'days').startOf('day'), moment().endOf('day'))) {
						return true;
					}
					return false;
				}
				return true;
			});
		},
		promotionOptions: function() {
			let options = [];
			this.promotions.forEach(promotion => {
				options.push({ id: promotion.name, text: promotion.name });
			})
			return options;
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
		allClick() {
			this.allFilter = true;
			this.todayFilter = false;
			this.thisWeekFilter = false;
			this.thisMonthFilter = false;
		},
		todayClick() {
			this.allFilter = false;
			this.todayFilter = true;
			this.thisWeekFilter = false;
			this.thisMonthFilter = false;
		},
		thisWeekClick() {
			this.allFilter = false;
			this.todayFilter = false;
			this.thisWeekFilter = true;
			this.thisMonthFilter = false;
		},
		thisMonthClick() {
			this.allFilter = false;
			this.todayFilter = false;
			this.thisWeekFilter = false;
			this.thisMonthFilter = true;
		}
	},
	created() {
		EventBus.getBatches()
		.then(response => this.batches = response.body)
		.catch(response => console.log(response));
		EventBus.getSales()
		.then(response => this.sales = response.body)
		.catch(response => console.log(response));
		EventBus.getPromotions()
		.then(response => this.promotions = response.body)
		.catch(response => console.log(response));
	},
	components: {
		salePromotion,
		select2: Select2
	}
}
</script>
