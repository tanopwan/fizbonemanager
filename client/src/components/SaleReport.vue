<template>
	<div>
		<div class="block full">
			<div class="block-title">
				<h4>
					Search <small> ค้นหา...</small>
				</h4>
			</div>
			<div class="row">
				<div class="col-xs-12 col-md-4">
					<ul class="pagination pagination-sm" style="margin-top: 3px;">
						<li :class="{ active : todayFilter }"><a href="javascript:void(0)" @click="todayClick">Today</a></li>
						<li :class="{ active : thisWeekFilter }"><a href="javascript:void(0)" @click="thisWeekClick">7 days</a></li>
						<li :class="{ active : customFilter }"><a href="javascript:void(0)" @click="thisCustomClick">Custom</a></li>
					</ul>
				</div>
				<div class="col-xs-12 col-md-8">
					<div class="input-group">
						<span class="input-group-addon">From Date</span>
						<input type="text" id="from-datepicker" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" v-model="from">
						<span class="input-group-addon">00:00</span>
						<span class="input-group-addon">To Date</span>
						<input type="text" id="to-datepicker" class="form-control input-datepicker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" v-model="to">
						<span class="input-group-addon">23:59</span>
						<span class="input-group-btn">
							<button type="button" @click="search" class="btn btn-success" style="overflow: hidden; position: relative;">Search</button>
						</span>
					</div>
				</div>
			</div>
		</div>
		<div class="block full">
			<div class="block-title">
				<h4>
					Filter
				</h4>
			</div>
			<div class="row">
				<div class="col-xs-12 col-md-6">
					<select2 :options="promotionOptions" v-model="selectedFilterPromotion" placeholder="Filter Promotion...">
						<option></option>
					</select2>
				</div>
				<div class="col-xs-12 col-md-6">
					<select2 :options="groupOptions" v-model="selectedFilterGroup" placeholder="Filter Group...">
						<option></option>
					</select2>
				</div>
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
						<th class="text-center">Product / Promotion</th>
						<th class="text-center">Date</th>
						<th class="text-center">Quantity<br><span class="label label-info">Sum: {{ sumQuantity }}</span></th>
						<th class="text-center">Price (&#x0E3F;)</th>
						<th class="text-center">Total (&#x0E3F;)<br><span class="label label-info">Sum: {{ sumTotal.toFixed(2) }}</span></th>
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
						<th class="text-center">{{ sale.price }}</th>
						<th class="text-center">{{ sale.total }}</th>
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
			todayFilter: true,
			thisWeekFilter: false,
			customFilter: false,
			datefilter: '',
			promotions: [],
			selectedFilterPromotion: '',
			selectedFilterGroup: '',
			sumQuantity: 0,
			sumTotal: 0,
			from: moment().startOf('day').format("YYYY-MM-DD"),
			to: moment().endOf('day').format("YYYY-MM-DD"),
			groupOptions: [
				{ id: "Booth", text: "Booth" },
				{ id: "Online", text: "Online" },
				{ id: "Consignment", text: "Consignment" },
				{ id: "Special", text: "Special" },
				{ id: "Sponsor", text: "Sponsor" },
				{ id: "Wholesale", text: "Wholesale" }
			]
		};
	},
	computed: {
		computedSales: function() {
			if (!this.sales || this.sales.length == 0) {
				return [];
			}

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
				if (!this.selectedFilterGroup || this.selectedFilterGroup.length === 0) {
					return true; // All
				}
				return sale.promotion.group === this.selectedFilterGroup;
			});

			this.sumQuantity = 0;
			this.sumTotal = 0;
			computed.forEach(sale => {
				if (sale.promotion) {
					sale.promotionName = sale.promotion.name;
					sale.price = (sale.promotion.price / 100).toFixed(2);
					if (sale.bill) {
						sale.total = (sale.bill.total / 100).toFixed(2);
						if (sale.bill.quantity) {
							this.sumQuantity += parseInt(sale.bill.quantity);
						}
						else if (sale.bill.bills) {
							this.sumQuantity += sale.bill.bills.reduce(function(a, b) {
								return a.quantity + b.quantity;
							}, {
								quantity: 0
							});
						}

						this.sumTotal += parseInt(sale.bill.total) / 100;
					}
					else {
						sale.total = '0.00';
					}
				}
				sale.stringDate = moment(sale.saleDate).format('LLL');
			});

			return computed;
		},
		promotionOptions: function() {
			let options = [];
			this.promotions.forEach(promotion => {
				if (!options.find(option => option.id === promotion.name)) {
					options.push({ id: promotion.name, text: promotion.name });
				}
			})
			return options;
		}
	},
	methods: {
		search() {
			let from = moment(this.from).startOf('day').format("YYYY-MM-DD HH:mm");
			let to = moment(this.to).endOf('day').format("YYYY-MM-DD HH:mm");
			this.$http.get(`/api/sales?from=${from}&to=${to}`)
			.then(response => this.sales = response.body.sales)
			.catch(response => console.log(response));
		},
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
			this.todayFilter = true;
			this.thisWeekFilter = false;
			this.customFilter = false;
			this.from = moment().format("YYYY-MM-DD");
			this.to = moment().format("YYYY-MM-DD");
		},
		thisWeekClick() {
			this.todayFilter = false;
			this.thisWeekFilter = true;
			this.customFilter = false;
			this.from = moment().add(-6, 'days').format("YYYY-MM-DD");
			this.to = moment().format("YYYY-MM-DD");
		},
		thisCustomClick() {
			this.todayFilter = false;
			this.thisWeekFilter = false;
			this.customFilter = true;
		}
	},
	created() {
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
			vm.from = moment($(this).val()).format("YYYY-MM-DD");
			vm.todayFilter = false;
			vm.thisWeekFilter = false;
			vm.customFilter = true;
		});

		$('#to-datepicker').datepicker().on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.to = moment($(this).val()).format("YYYY-MM-DD");
			vm.todayFilter = false;
			vm.thisWeekFilter = false;
			vm.customFilter = true;
		});
	}
}
</script>
