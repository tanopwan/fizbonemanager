<template>
	<div class="row">
		<div class="col-xs-12 col-sm-6">
			<div class="block">
				<date-time-picker v-on:input="onDatetime"></date-time-picker>
				<div class="form-group">
					<select2 :options="productOptions" v-model="selectedProduct" allowClear="false" placeholder="Select Product..." v-on:input="onSelectProduct">
						<option></option>
					</select2>
				</div>
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
				<div class="row">
					<div class="col-xs-6">
						<div class="form-group">
							<select2 :options="customerOptions" v-model="selectedCustomer" allowClear="true" placeholder="Select Customer..." v-on:input="onSelectCustomer">
								<option></option>
							</select2>
						</div>
					</div>
					<div class="col-xs-6">
						<input type="text" class="form-control" v-model="tagString" placeholder="tags"></input>
					</div>
				</div>
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">Quantity</span>
						<input type="number" class="form-control" v-model="quantity">
						<span class="input-group-addon" @click="quantity++"><i class="fa fa-plus"></i></span>
						<span class="input-group-addon" @click="quantity--"><i class="fa fa-minus"></i></span>
						<span class="input-group-addon">&#x0E3F;</span>
						<input type="number" class="form-control" v-model="priceBaht">
					</div>
				</div>
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">Desc</span>
						<input type="text" class="form-control" v-model="description"></input>
					</div>
				</div>
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-btn">
							<button type="button" @click="clear" class="btn btn-success" style="overflow: hidden; position: relative;">Clear</button>
							<button type="button" @click="addSale" class="btn btn-success" style="overflow: hidden; position: relative;">Add</button>
						</span>
						<span class="btn text-danger">{{ errorMessage }}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="hidden-xs col-sm-6">
			<div class="widget">
				<div class="widget-content text-right clearfix">
					<div class="pull-left">
						<img :src="productLink" class="img-thumbnail img-thumbnail-avatar-2x">
					</div>
					<h3 class="widget-heading text-primary">{{ selectedProduct }}<br><small>{{ selectedBatch.split('/')[1] }}</small></h3>
					<h4 class="widget-heading text-warning">{{ selectedPromotion }} <small>Group: {{ selectedGroup }}</small></h4>
					<h5 class="widget-heading text-muted">{{ datetime }}</h5>
				</div>
				<div class="widget-content">
					<div class="text-muted">
						<p>
							Customer: <i class="gi gi-user text-muted"></i> {{ customerName }}<br>
							Description: {{ description }}
							<span style="margin-right: 5px" v-for="tag in tags" class="label label-info">{{ tag }}</span>
						</p>
					</div>
				</div>
				<div class="widget-content">
					<div class="row text-center">
						<div class="col-xs-4">
							<h3 class="widget-heading"><small>PRICE</small><br><a href="javascript:void(0)" class="themed-color-passion">{{ priceBaht }}</a></h3>
						</div>
						<div class="col-xs-4">
							<h3 class="widget-heading"><small>QUANTITY</small><br><a href="javascript:void(0)" class="themed-color-passion">{{ quantity }}</a></h3>
						</div>
						<div class="col-xs-4">
							<h3 class="widget-heading"><small>TOTAL</small><br><a href="javascript:void(0)" class="themed-color-passion">{{ (quantity * priceBaht).toFixed(2)}}</a></h3>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import moment from 'moment';
import { EventBus } from '../bus';
import Select2 from './basic/Select2.vue';
import DateTimePicker from './basic/DateTimePicker.vue'

export default {
	props: ['onAddSale'],
	data() {
		return {
			productsWithBatches: [],
			promotions: [],
			customers: [],
			quantity: 0,
			priceBaht: 0,
			description: '',
			productLink: '',
			customerName: '',
			customerType: '',
			tagString: '',
			selectedProduct: '',
			selectedBatch: '',
			selectedPromotion: '',
			selectedGroup: '',
			selectedCustomer: '',
			datetime: null,
			errorMessage: ''
		};
	},
	computed: {
		tags() {
			return this.tagString.split(' ');
		},
		price() {
			return this.priceBaht * 100;
		},
		productOptions() {
			let options = [];
			this.productsWithBatches.forEach(product => {
				options.push({ id: product.name, text: product.name });
			});
			return options;
		},
		batchOptions() {
			let options = [];
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
	methods: {
		addSale() {
			this.errorMessage = '';
			if (!this.selectedProduct || !this.selectedBatch || !this.selectedPromotion) {
				this.errorMessage = 'Missing fields';
				return;
			}

			if (this.quantity <= 0) {
				this.errorMessage = 'Quantity should be positive';
				return;
			}

			let data = {
				quantity: this.quantity,
				description: this.description,
				saleDate: moment(this.datetime, "YYYY-MM-DD HH:mm"),
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
				tags: this.tagString.split(' ')
			}

			if (this.selectedGroup !== "Consignment") {
				data.bill = {
					bills: {
						quantity: this.quantity,
						price: this.price,
						date: moment()
					},
					total: this.quantity,
					quantity: this.quantity * this.price
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

			EventBus.addSale(data).then(response => {
				this.onAddSale(response.body);
				this.clear();
			})
			.catch(response => console.log(response));
		},
		clear() {
			this.selectedProduct = '';
			this.productLink = '';
			this.selectedBatch = '';
			this.selectedPromotion = '';
			this.selectedGroup = '';
			this.selectedCustomer = '';
			this.priceBaht = 0;
			this.quantity = 0;
			this.tagString = '';
		},
		onSelectProduct(value) {
			this.productLink = '';
			this.selectedBatch = '';
			this.selectedPromotion = '';
			this.selectedGroup = '';
			this.priceBaht = 0;
			this.quantity = 0;

			let productWithBatches = this.productsWithBatches.find(product => product.name === value);
			if (productWithBatches) {
				this.productLink = productWithBatches.link;
			}
		},
		onSelectPromotion(value) {
			if (value) {
				this.selectedBatch = '';
				this.selectedGroup = '';
				this.priceBaht = 0;
				this.quantity = 0;
				let promotion = this.promotions.find(promotion => promotion.name === value && promotion.product.name === this.selectedProduct);
				if (promotion) {
					console.log(promotion);
					let batchIdAndRef = promotion.batch.batchId + '/' + promotion.batch.batchRef;
					this.selectedBatch = batchIdAndRef;
					this.selectedGroup = promotion.group;
					this.priceBaht = promotion.price / 100;
					this.quantity = promotion.quantity;
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
		onDatetime(value) {
			this.datetime = value;
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
					this.updateStock();
				}
			}, response => {
				console.log(response);
			});
		},
		updateStock() {
			EventBus.getBatchStock()
			.then(response => this.batchStocks = response.body)
			.catch(response => console.log(response));
		}
	},
	created() {
		EventBus.getProductsWithBatches()
		.then(response => {
			this.productsWithBatches = response.body;
		})
		.catch(response => console.log(response));

		EventBus.getPromotions()
		.then(response => {
			this.promotions = response.body;
		})
		.catch(response => console.log(response));

		EventBus.getCustomers()
		.then(response => this.customers = response.body)
		.catch(response => console.log(response));
		this.updateStock();
	},
	components: {
		select2: Select2,
		dateTimePicker: DateTimePicker
	}
}
</script>
