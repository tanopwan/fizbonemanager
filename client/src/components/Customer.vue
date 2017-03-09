<template>
	<div>
		<div class="row">
			<div class="col-md-6">
				<div class="block">
					<div class="form-group">
						<div class="input-group">
							<input type="text" v-model="customerName" class="form-control" placeholder="Customer Name">
							<span class="input-group-btn">
								<button type="button" @click="addCustomer" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
							</span>
						</div>
					</div>
					<div class="form-group">
						<textarea v-model="customerAddress" id="example-textarea-input" rows="2" class="form-control" placeholder="ที่อยู่.."></textarea>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="block full">
					<div class="block-title">
						<h4>
							All Customers <small> Total: {{ customers.length }}</small>
						</h4>
					</div>
					<template v-for="customer in customers">
						<div>
							<div class="pull-right">
								{{ customer._id }}
								<button class="btn btn-danger" @click="deleteCustomer(customer._id)"><i class="fa fa-minus"></i></button>
							</div>
							<h4 class="sub-header">
								{{ customer.name }}
							</h4>
						</div>
					</template>
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
			customerAddress: '',
			customers: []
		};
	},
	methods: {
		addCustomer() {
			this.$http.post('/api/customers', { name: this.customerName, address: this.customerAddress }).then(response => {
				this.customers.push(response.body);
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
