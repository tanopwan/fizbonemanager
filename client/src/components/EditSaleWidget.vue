<template>
	<div>
		<div id="edit-sale-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title"><strong>Sale </strong><small>{{ this.sale._id }}</small></h3>
					</div>
					<div class="modal-body">
						<date-time-picker v-model="datetime" update="false"></date-time-picker>
						<div class="row">
							<div class="col-xs-6">
								<div class="form-group">
									<select2 :options="promotionOptions" v-model="selectedPromotion" allowClear="false" placeholder="Select Promotion..." v-on:input="onSelectPromotion">
										<option></option>
									</select2>
								</div>
							</div>
							<div class="col-xs-6">
								<div class="form-group">
									<select2 :options="batchOptions" v-model="selectedBatch" allowClear="false" placeholder="Select Batch...">
										<option></option>
									</select2>
								</div>
							</div>
						</div>
						<div class="row form-group">
							<div class="col-xs-12">
								<div class="input-group">
									<span class="input-group-addon">Order Id</span>
									<input type="text" v-model="orderId" class="form-control">
								</div>
							</div>
						</div>
						<div class="row form-group">
							<div class="col-xs-6">
								<div class="input-group">
									<span class="input-group-addon">จำนวน</span>
									<input type="text" v-model="quantity" class="form-control" placeholder="จำนวน">
								</div>
							</div>
							<div class="col-xs-6">
								<div class="input-group">
									<span class="input-group-addon">ราคา</span>
									<input type="text" v-model="priceBaht" class="form-control" placeholder="ราคา">
								</div>
							</div>
						</div>
						<div class="row form-group">
							<div class="col-xs-6">
								<select2 :options="customerOptions" v-model="selectedCustomer" allowClear="true" placeholder="Select Customer..." v-on:input="onSelectCustomer">
									<option></option>
								</select2>
							</div>
							<div class="col-xs-6">
								<input type="text" class="form-control" v-model="tagString" placeholder="tags"></input>
							</div>
						</div>
						<div class="row form-group">
							<div class="col-xs-12">
								<div class="input-group">
									<span class="input-group-addon">Desc</span>
									<input type="text" class="form-control" v-model="description"></input>
								</div>
							</div>
						</div>
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
import Select2 from './basic/Select2.vue';
import DateTimePicker from './basic/DateTimePicker.vue'

export default {
	props: ['saleProp', 'onUpdateSale'],
	data() {
		return {
			sale: JSON.parse(this.saleProp),
			sale1: this.saleProp,
			promotions: [],
			productsWithBatches: [],
			customers: [],
			selectedProduct: '',
			selectedPromotion: '',
			selectedBatch: '',
			selectedCustomer: '',
			customerName: '',
			customerType: '',
			tagString: '',
			description: '',
			quantity: 0,
			priceBaht: 0,
			orderId: '',
			datetime: null,
			saving: false,
		}
	},
	watch: {
		saleProp: function(val) {
			this.sale = JSON.parse(this.saleProp);
			this.datetime = moment(this.sale.saleDate).format("YYYY-MM-DD HH:mm");
			this.selectedProduct = this.sale.product.name;
			this.selectedPromotion = this.sale.promotion.name;
			this.selectedBatch = this.sale.batch.batchId + '/' + this.sale.batch.batchRef;
			this.priceBaht = this.sale.promotion.price / 100;
			this.quantity = this.sale.quantity;
			this.description = this.sale.description;
			this.orderId = this.sale.orderId;
			if (this.sale.tags) {
				this.tagString = this.sale.tags.join(' ');
			}
		},
	},
	methods: {
		save() {
			this.errorMessage = '';
			if (!this.selectedProduct || !this.selectedBatch || !this.selectedPromotion) {
				this.errorMessage = 'Missing fields';
				return;
			}

			if (this.quantity <= 0) {
				this.errorMessage = 'Quantity should be positive';
				return;
			}

			this.saving = true;
			let data = {
				quantity: this.quantity,
				description: this.description,
				saleDate: this.now ? moment() : moment(this.datetime),
				product: {
					name: this.selectedProduct
				},
				batch: {
					batchId: this.selectedBatch.split('/')[0],
					batchRef: this.selectedBatch.split('/')[1]
				},
				promotion: {
					name: this.selectedPromotion,
					price: this.price,
					group: this.selectedGroup
				},
				tags: this.tagString.split(' '),
				orderId: this.orderId,
			}

			if (this.selectedGroup !== "Consignment") {
				data.bill = {
					bills: {
						quantity: this.quantity,
						price: this.price,
						date: moment()
					},
					total: this.quantity * this.price,
					quantity: this.quantity
				}
			}

			if (this.selectedCustomer) {
				let customer = this.customers.find(customer => customer._id === this.selectedCustomer);
				data.customer = {
					name: customer.name,
					type: customer.type,
					refUserId: customer.refUserId
				}
			}
			console.log(data);

			this.$http.post('/api/sales/' + this.sale._id, data).then(response => {
				this.onUpdateSale(response.body);
				EventBus.expireCache('/api/sales');
				this.saving = false;
			})
			.catch(response => this.saving = false);
		},
		onSelectPromotion(value) {
			if (value) {
				this.selectedGroup = '';
				let promotion = this.promotions.find(promotion => promotion.name === value && promotion.product.name === this.selectedProduct);
				if (promotion) {
					this.selectedGroup = promotion.group;
				}
			}
		},
		onSelectCustomer(value) {
			if (value) {
				let customer = this.customers.find(customer => customer._id === value);
				this.customerName = customer.name;
				this.customerType = customer.type;
			}
		},
		updateStock() {
			EventBus.getBatchStock()
			.then(response => this.batchStocks = response.body)
			.catch(response => console.log(response));
		}
	},
	computed: {
		price() {
			return this.priceBaht * 100;
		},
		batchOptions() {
			let options = [];
			if (!this.productsWithBatches) {
				return [];
			}
			let productWithBatches = this.productsWithBatches.find(product => product.name === this.selectedProduct);
			if (productWithBatches) {
				productWithBatches.batches.forEach(batch => {
					let batchIdAndRef = batch._id + '/' + batch.batchRef;
					options.push({ id: batchIdAndRef, text: batch.batchRef });
				});
			}
			return options;
		},
		promotionOptions() {
			let options = [];
			this.promotions.filter(promotion => {
				return promotion.product.name === this.selectedProduct;
			}).forEach(promotion => {
				options.push({ id: promotion.name, text: promotion.name + " [Group: " + promotion.group + "]" });
			});
			return options;
		},
		customerOptions: function() {
			let options = [];
			this.customers.forEach(customer => {
				options.push({ text: customer.name, id: customer._id });
			})
			return options;
		},
	},
	created() {
		EventBus.getProductsWithBatches()
		.then(response => {
			this.productsWithBatches = response.body;
		})
		.catch(response => console.log(response));

		EventBus.getPromotions()
		.then(response => {
			this.promotions = response.body
		})
		.catch(response => console.log(response));

		EventBus.getCustomers()
		.then(response => {
			this.customers = response.body;
		})
		.catch(response => console.log(response));
		this.updateStock();
	},
	components: {
		select2: Select2,
		dateTimePicker: DateTimePicker
	}
}
</script>
