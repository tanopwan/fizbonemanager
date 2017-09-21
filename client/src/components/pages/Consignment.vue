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
						<date-time-picker update="false" v-on:input="onDatetime"></date-time-picker>
						<div class="row form-group" :class="{ 'has-error': quantityError }">
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
						<button type="button" @click="bill" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Save</button>
						<button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
					</div>
				</div>
			</div>
		</div>
		<div class="block full">
			<div class="block-title">
				<h4>
					Search
				</h4>
			</div>
			<div>
				<form class="form-horizontal">
					<div class="row">
						<div class="col-xs-12 col-md-6">
							<div class="form-group">
								<label class="col-xs-3 control-label">Customer</label>
								<div class="col-xs-9">
									<select2 :options="customerOptions" v-model="selectedCustomer" placeholder="Filter Customer...">
										<option></option>
									</select2>
								</div>
							</div>
						</div>
						<div class="col-xs-12 col-md-6">
							<label class="csscheckbox csscheckbox-danger">
								<input type="checkbox" v-model="includeBilledSales"><span></span> Include billed sales
							</label>
							<button type="button" @click="search" class="btn btn-success" style="overflow: hidden; position: relative;">Search</button>
						</div>
					</div>
				</form>
			</div>
		</div>
		<div class="block full">
			<div class="block-title">
				<h4>
					Consignment(s) <small> Total: {{ totalConsignments }}, Count: {{ consignments.length }}, Page: {{ currentPage + 1 }} / {{ totalPage }}</small>
				</h4>
			</div>
			<div class="text-center">
				<ul class="pagination">
					<li><a @click="gotoPrev"><i class="fa fa-chevron-left"></i></a></li>
					<li v-for="page in Array.from(Array(totalPage).keys())"  :class="{ 'active': (page === currentPage) }">
						<a @click="goto(page)">{{ page + 1 }}</a>
					</li>
					<li><a @click="gotoNext"><i class="fa fa-chevron-right"></i></a></li>
				</ul>
			</div>
			<table class="table table-striped table-borderless table-vcenter">
				<thead>
					<tr>
						<th class="text-center">Date</th>
						<th class="text-center hidden-sm hidden-xs">Customer</th>
						<th class="text-center">Quantity</th>
						<th class="text-center">Total (&#x0E3F;)</th>
						<th class="text-center hidden-sm hidden-xs">Description</th>
						<th class="text-center">Manage</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="consignment in computedConsignments">
						<td class="text-center">{{ consignment.stringDate }}</td>
						<td class="hidden-sm hidden-xs">{{ consignment.customerName }} / {{ consignment.product.name }}</td>
						<th class="text-center">{{ consignment.bill ? consignment.bill.quantity : 0 }} / {{ consignment.quantity }}</th>
						<th class="text-center">{{ consignment.bill ? (consignment.bill.total / 100).toFixed(2) : 0 }}</th>
						<td class="hidden-sm hidden-xs">{{ consignment.description }}</td>
						<th class="text-center">
							<a v-if="!consignment.bill || consignment.bill.quantity !== consignment.quantity" href="#modal-regular" @click="openConsignment(consignment._id)" class="btn btn-warning" data-toggle="modal" style="overflow: hidden; position: relative;">
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
import { EventBus } from 'src/bus';
import Vue from 'vue';
import DateTimePicker from 'basic/DateTimePicker.vue';
import Select2 from 'basic/Select2.vue';

export default {
	data() {
		return {
			// Search
			consignments: [],
			totalConsignments: 0,
			// Filter
			customers: [],
			selectedCustomer: '',
			includeBilledSales: false,
			// Paging
			currentPage: 0,
			pageSize: 10,
			// Bill a sale
			currentConsignment: {},
			datetime: null,
			billQuantity: 0,
			billPrice: 0,
			quantityError: false,
		};
	},
	computed: {
		totalPage: function() {
			return Math.ceil(this.totalConsignments / this.pageSize);
		},
		computedConsignments: function() {
			if (this.consignments) {
				this.consignments.forEach(consignment => {
					consignment.promotionName = consignment.promotion.name;
					consignment.price = consignment.promotion.price / 100;
					consignment.total = consignment.promotion.price * consignment.quantity / 100;
					consignment.stringDate = moment(consignment.saleDate).format('LLL');
					consignment.customerName = consignment.customer ? consignment.customer.name : 'ทั่วไป';

					if (consignment.bill) {
						consignment.bill.quantity = consignment.bill.bills.reduce((a, b) => {
							return { quantity: a.quantity + b.quantity };
						}, { quantity: 0 }).quantity;
					}
				});

				return this.consignments.sort(function(s1, s2){
					let isAfter = moment(s1.saleDate).isAfter(s2.saleDate);
					if (isAfter) {
						return -1;
					}
					return 1;
				});
			}

			return [];
		},
		customerOptions: function() {
			let options = [];
			if (this.customers) {
				this.customers.forEach(customer => {
					options.push({ text: customer.name, id: customer.name });
				})
			}

			return options;
		},
	},
	methods: {
		goto(page) {
			if (this.currentPage != page) {
				this.currentPage = page;
				this.search();
			}
		},
		gotoPrev() {
			if (this.currentPage > 0) {
				this.goto(this.currentPage - 1);
			}
		},
		gotoNext() {
			if (this.currentPage < this.totalPage - 1) {
				this.goto(this.currentPage + 1);
			}
		},
		search() {
			let uri = '';
			if (this.selectedCustomer) {
				uri = `/api/sales?group=Consignment&includeBilledSales=${this.includeBilledSales}&customer=${this.selectedCustomer}&limit=${this.pageSize}&offset=${this.pageSize * this.currentPage}`;
			}
			else {
				uri = `/api/sales?group=Consignment&includeBilledSales=${this.includeBilledSales}&limit=${this.pageSize}&offset=${this.pageSize * this.currentPage}`
			}

			this.$http.get(uri)
			.then(response => {
				this.consignments = response.body.sales;
				this.totalConsignments = response.body.total;
			})
			.catch(response => console.log(response));
		},
		bill() {
			this.quantityError = false;
			if (this.billQuantity <= 0 || this.billQuantity > this.currentConsignment.quantity - (this.currentConsignment.bill ? this.currentConsignment.bill.quantity : 0)) {
				this.quantityError = true;
				return;
			}

			let bill = {
				quantity: this.billQuantity,
				price: this.billPrice * 100,
				date: moment(this.datetime, "YYYY-MM-DD HH:mm")
			};

			this.$http.post(`/api/sales/bill/${this.currentConsignment._id}`, bill).then(response => {
				$('#modal-regular').modal('hide');
				Vue.set(this.currentConsignment, 'bill', response.body.bill);
			}).catch(response => console.log(response));
		},
		openConsignment(id) {
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
				}
			}, response => {
				console.log(response);
			});
		},
		onDatetime(value) {
			this.datetime = value;
		},
	},
	created() {

		EventBus.getCustomers().then(response => {
			this.customers = response.body;
		})
		.catch(response => console.log(response));
	},
	components: {
		dateTimePicker: DateTimePicker,
		select2: Select2
	}
}
</script>
