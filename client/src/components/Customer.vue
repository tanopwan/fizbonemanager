<template>
	<div>
		<div class="row">
			<div class="col-md-12">
				<div class="block">
					<div class="form-horizontal form-bordered">
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">Name</label>
							<div class="col-md-6">
								<input type="text" v-model="customerName" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">Contact</label>
							<div class="col-md-6">
								<input type="text" v-model="contact" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">Address</label>
							<div class="col-md-6">
								<input type="text" v-model="street" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">Sub District</label>
							<div class="col-md-6">
								<input type="text" v-model="subDistrict" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">District</label>
							<div class="col-md-6">
								<input type="text" v-model="district" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">Province</label>
							<div class="col-md-6">
								<input type="text" v-model="province" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<label class="col-md-3 control-label" for="example-text-input">Postal Code</label>
							<div class="col-md-6">
								<input type="text" v-model="postalCode" class="form-control" placeholder="">
							</div>
						</div>
						<div class="form-group">
							<div class="col-md-6 col-sm-offset-3">
								<button type="button" @click="addCustomer" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12">
				<div class="block full">
					<div class="block-title">
						<h4>
							All Customers
							<small> Total: {{ customers.length }}</small>
						</h4>
					</div>
					<table id="general-table" class="table table-vcenter table-borderless table-condensed table-hover">
						<thead>
							<tr>
								<th>Id</th>
								<th>Name</th>
								<th>Provider</th>
								<th>Address</th>
								<th style="width: 120px;" class="text-center">
									<i class="fa fa-flash"></i>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="customer in customers" v-bind:key="customer._id">
								<td>{{ customer._id }}</td>
								<td>{{ customer.name }}</td>
								<td>
									<button v-if="customer.type==='FacebookOnline'" class="btn btn-info">
										<i class="fa fa-facebook"></i>
									</button>
								</td>
								<td>{{ customer.address }}</td>
								<td class="text-center">
									<a href="#show-customer-modal" @click="showCustomerModal(customer._id)" data-toggle="modal" class="btn btn-effect-ripple btn-sm btn-success" style="overflow: hidden; position: relative;">
										<i class="fa fa-pencil"></i>
									</a>
									<a href="javascript:void(0)" @click="deleteCustomer(customer._id)" class="btn btn-effect-ripple btn-sm btn-danger" style="overflow: hidden; position: relative;">
										<i class="fa fa-times"></i>
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div id="show-customer-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title">
							<strong>Customer</strong>
							<small></small>
						</h3>
					</div>
					<div class="modal-body">
						<pre ref="customerStringEditor" style="background-color: #f5f5f5;" contenteditable="true"></pre>
					</div>
					<div class="modal-footer">
						<i v-if="saving" class="fa fa-asterisk fa-2x fa-spin text-success"></i>
						<span v-else>
							<button type="button" @click="save" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Save</button>
							<button type="button" class="btn btn-effect-ripple btn-danger" data-dismiss="modal" style="overflow: hidden; position: relative;">Close</button>
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

import { EventBus } from '../bus';

export default {
	data() {
		return {
			customerName: '',
			customers: [],
			saving: false,
			contact: '',
			street: '',
			subDistrict: '',
			district: '',
			province: '',
			postalCode: '',
		};
	},
	methods: {
		addCustomer() {
			this.$http.post('/api/customers', {
				name: this.customerName,
				address: {
					name: this.contact,
					street: this.street,
					subDistrict: this.subDistrict,
					district: this.district,
					province: this.province,
					postalCode: this.postalCode,
				},
				type: 'Normal'
			}).then(response => {
				this.customers.splice(0, 0, response.body);
				this.contact = '';
				this.street = '';
				this.subDistrict = '';
				this.district = '';
				this.province = '';
				this.postalCode = '';
			}, response => {
					console.log(response);
				});
		},
		deleteCustomer(id) {
			this.$http.delete('/api/customers/' + id).then(response => {
				let index = -1;
				this.customers.forEach((customer, idx) => {
					if (customer._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.customers.splice(index, 1);
				}
			}, response => {
				console.log(response);
			});
		},
		showCustomerModal(id) {
			let customer = this.customers.find(customer => customer._id === id);
			if (customer) {
				this.customerString = JSON.stringify(customer, null, 4);
				$(this.$refs.customerStringEditor).text(this.customerString);
			}
			else {
				this.customerString = `{ \"error\": \"customer._id ${id} is not found.\" }`;
			}
		},
		save() {
			this.saving = true;
			this.customerString = $(this.$refs.customerStringEditor).text();
			try {
				let customer = JSON.parse(this.customerString);

				let vm = this;
				let id = customer._id;
				this.$http.post('/api/customers/' + id, customer).then(response => {
					let index = -1;
					vm.customers.forEach((customer, idx) => {
						if (customer._id === id) {
							index = idx;
						}
					});
					if (index !== -1) {
						vm.customers[index] = response.data;
					}
					vm.saving = false;
				}).catch(response => {
					console.log(response)
					vm.saving = false;
				});
			}
			catch (error) {
				console.log("Parse Error", error);
				this.saving = false;
			}
		}
	},
	created() {
		EventBus.getCustomers()
			.then(response => this.customers = response.body)
			.catch(response => console.log(response));
	}
}
</script>

<style>

</style>
