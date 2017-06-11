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

					<div class="col-xs-12 col-md-6">
						<div class="input-group">
							<span class="input-group-addon">From Date</span>
							<input type="text" id="from-datepicker" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" v-model="from">
							<span class="input-group-addon">To Date</span>
							<input type="text" id="to-datepicker" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" v-model="to">
						</div>
					</div>
					<div class="col-xs-12 col-md-6">
						<label class="col-xs-6 col-md-3 control-label">Filter Date</label>
						<ul class="pagination pagination-sm" style="margin-top: 3px;">
							<li :class="{ active : todayFilter }"><a href="javascript:void(0)" @click="todayClick">Today</a></li>
							<li :class="{ active : thisWeekFilter }"><a href="javascript:void(0)" @click="thisWeekClick">7 days</a></li>
							<li :class="{ active : customFilter }"><a href="javascript:void(0)" @click="thisCustomClick">Custom</a></li>
						</ul>
					</div>
					<div class="col-xs-12 col-md-6">
						<div class="form-group">
							<label class="col-xs-3 control-label">Filter Promotion</label>
							<div class="col-xs-9">
								<select2 :options="promotionOptions" v-model="selectedFilterPromotion" placeholder="Filter Promotion...">
									<option></option>
								</select2>
							</div>
						</div>
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
						<th class="text-center">Product / Promotion</th>
						<th class="text-center">Date</th>
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
						<td>{{ sale.product ? sale.product.name : '' }} / {{ sale.promotionName }}</td>
						<td class="text-center">{{ sale.stringDate }}</td>
						<th class="text-center">{{ sale.quantity }}</th>
						<th class="text-center">{{ sale.price ? sale.price.toFixed(2) : 'N/A' }}</th>
						<th class="text-center">{{ sale.price ? sale.total.toFixed(2) : 'N/A' }}</th>
						<td class="text-center">
							<button v-if="sale.customer ? sale.customer.type==='FacebookOnline' : false" class="btn btn-info" :alt="sale.customer ? sale.customer.userRefId : ''"><i class="fa fa-facebook"></i></button>
							{{ sale.customer ? sale.customer.name : '' }}
						</td>
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
			sales: [],
			todayFilter: false,
			thisWeekFilter: false,
			customFilter: false,
			datefilter: '',
			promotions: [],
			selectedFilterPromotion: '',
			sumQuantity: 0,
			sumTotal: 0,
			from: moment().startOf('day').format("YYYY-MM-DD HH:mm"),
			to: moment().startOf('day').add(1, 'days').format("YYYY-MM-DD HH:mm")
		};
	},
	computed: {
		computedSales: function() {
			console.log(this.sales);
			if (!this.sales || this.sales.length == 0) {
				return [];
			}
			this.sumQuantity = 0;
			this.sumTotal = 0;
			this.sales.forEach(sale => {
				if (sale.promotion) {
					sale.promotionName = sale.promotion.name;
					sale.price = sale.promotion.price / 100;
					sale.total = sale.promotion.price * sale.quantity / 100;
					this.sumQuantity += sale.quantity;
					this.sumTotal += sale.total;
				}
				sale.stringDate = moment(sale.saleDate).format('LLL');
			});

			let computed = this.sales.sort(function(s1, s2){
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
				if (this.todayFilter) {
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
				}
				return true;
			});

			this.sumQuantity = 0;
			this.sumTotal = 0;
			computed.forEach(sale => {
				this.sumQuantity += sale.quantity;
				this.sumTotal += sale.total;
			});

			return computed;
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
		todayClick() {
			this.from = moment().startOf('day').format("YYYY-MM-DD HH:mm");
			this.to = moment().endOf('day').format("YYYY-MM-DD HH:mm");
		},
		thisWeekClick() {
			this.from = moment().startOf('day').add(-6, 'days').format("YYYY-MM-DD HH:mm");
			this.to = moment().endOf('day').add(1, 'days').format("YYYY-MM-DD HH:mm");
		},
		thisCustomClick() {
			this.allFilter = false;
			this.todayFilter = false;
			this.thisWeekFilter = false;
			this.customFilter = true;
		}
	},
	created() {
		// var today = moment().startOf('day');
		// var tomorrow = moment(today).add(1, 'days');

		this.$http.get(`/api/sales?from=${this.from}&to=${this.to}`)
			.then(response => this.sales = response.body)
			.catch(response => console.log(response));
		EventBus.getPromotions()
			.then(response => this.promotions = response.body)
			.catch(response => console.log(response));
	},
	components: {
		salePromotion,
		select2: Select2
	},
	mounted() {
		$('.select-select2').select2();
		let vm = this;
		$('#from-datepicker').datepicker().on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.from = $(this).val();
		});

		$('#to-datepicker').datepicker("setDate", this.to).on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.to = $(this).val();
		});
	}
}
</script>
