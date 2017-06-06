<template>
	<div class="col-xs-12 col-sm-6 col-md-4">
		<div class="widget">
			<div class="widget-content text-light-op" v-bind:class="bgClasses[index % 5]">
				<a @click="viewMore=!viewMore" href="javascript:void(0)" class="pull-right text-light-op" style="overflow: hidden; position: relative;">
					<span v-show="!viewMore">More <i class="fa fa-arrow-circle-o-right"></i></span>
					<span v-show="viewMore">Less <i class="fa fa-arrow-circle-o-left"></i></span>
				</a>
				<i class="fa fa-fw fa-chevron-right"></i> <strong>{{ promotion.name }}</strong>
			</div>
			<div v-if="viewMore" class="widget-content themed-background-muted text-center">
				<div class="form-group" :class="{ 'has-error': error }">
					<div class="input-group">
						<span class="input-group-addon">Q</span>
						<input type="number" class="form-control" v-model="quantity"></input>
						<span class="input-group-addon" @click="quantity++"><i class="fa fa-plus"></i></span>
						<span class="input-group-addon" @click="quantity--"><i class="fa fa-minus"></i></span>
						<input type="number" class="form-control" v-model="priceBaht"></input>
					</div>
					<span v-if="error">{{ errorMessage }}</span>
				</div>
				<div class="form-group">
					<div class="input-group" style="width: 100%;">
						<select2 :options="customerOptions" v-model="selectedCustomer" placeholder="เลือก ลูกค้า..." allowClear="true">
							<option></option>
						</select2>
					</div>
				</div>
				<div class="row form-group">
					<div class="col-xs-12">
						<select2 :options="productOptions" v-model="selectedProduct" allowClear="false" placeholder="Select Product...">
							<option></option>
						</select2>
					</div>
				</div>
				<div class="row form-group">
					<div class="col-xs-12">
						<select2 :options="batchOptions" v-model="selectedBatch" allowClear="false" placeholder="Select Batch...">
							<option></option>
						</select2>
					</div>
				</div>
				<div class="form-group">
					<div class="input-group">
						<span class="input-group-addon">รายละเอียด</span>
						<input type="text" class="form-control" v-model="description"></input>
						<span class="input-group-btn">
							<button @click="addSaleInternal(getAvaliableStock(promotion.batch.batchId))" type="button" class="btn btn-effect-ripple btn-primary" style="overflow: hidden; position: relative;">Add</button>
						</span>
					</div>
				</div>
			</div>
			<div v-show="viewMore" class="widget-content widget-content-full-top-bottom border-bottom">
				<div class="row text-center">
					<div class="col-xs-6 push-inner-top-bottom border-right">
						<h3 class="widget-heading"><i class="hi hi-tag text-dark push"></i> <br><small>{{ (promotion.price / 100).toFixed(2) }} x {{ quantity }}</small></h3>
					</div>
					<div class="col-xs-6 push-inner-top-bottom">
						<h3 class="widget-heading"><i class="gi gi-calculator text-dark push"></i> <br><small>&#x0E3F;{{ (promotion.price * quantity / 100).toFixed(2) }}</small></h3>
					</div>
				</div>
			</div>
			<div v-show="viewMore" class="widget-content widget-content-full-top-bottom border-bottom">
				<div class="row text-center">
					<div class="col-xs-6 push-inner-top-bottom border-right">
						<h3 class="widget-heading"><i class="gi gi-sort text-dark push"></i> <br><small>{{ getAvaliableStock(promotion.batchId) }} in stocks</small></h3>
					</div>
					<div class="col-xs-6 push-inner-top-bottom">
						<h3 class="widget-heading"><i class="gi gi-more_items text-dark push"></i> <br><small>{{promotion.batch.batchRef}}</small></h3>
					</div>
				</div>
			</div>
			<div class="widget-content text-center">
				<h3 class="widget-heading text-dark">
					{{ promotion.product.name }}
				</h3>
			</div>
		</div>
	</div>

</template>

<script>
import { EventBus } from '../bus';
import moment from 'moment';
import Select2 from './basic/Select2.vue';

export default {
	props: ['productsWithBatches', 'batchStocks', 'promotion', 'isConsignment', 'index', 'onAddSale', 'customers'],
	data() {
		return {
			viewMore: this.isConsignment,
			bgClasses: [
				'themed-background',
				'themed-background-dark',
				'themed-background-success',
				'themed-background-info',
				'themed-background-danger'
			],
			saleDate: new Date(),
			priceBaht: this.promotion.price / 100,
			quantity: this.promotion.quantity,
			description: '',
			error: false,
			errorMessage: '',

			selectedCustomer: '',
			selectedBatch: this.promotion && this.promotion.batch ? this.promotion.batch.batchId + '/' + this.promotion.batch.batchRef : '',
			selectedProduct: this.promotion.product.name
		}
	},
	computed: {
		customerOptions: function() {
			let options = [];
			this.customers.forEach(customer => {
				options.push({ text: customer.name, id: customer._id });
			})
			return options;
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
			let productsWithBatch = this.productsWithBatches.find(product => product.name === this.selectedProduct);
			if (productsWithBatch) {
				productsWithBatch.batches.forEach(batch => {
					let batchIdAndRef = batch._id + '/' + batch.batchRef;
					options.push({ id: batchIdAndRef, text: batch.batchRef });
				});
			}
			return options;
		}
	},
	methods: {
		addSaleInternal(stock) {
			let changedDate = moment(this.saleDate, "YYYY-MM-DD")
			var iscurrentDate = changedDate.isSame(new Date(), "day");
			if (iscurrentDate) {
				// update time
				this.saleDate = moment();
			}

			if (this.quantity > stock) {
				this.error = true;
				this.errorMessage = "Over stocks!";
				return false;
			}

			let data = {
				quantity: this.quantity,
				description: this.description,
				saleDate: this.saleDate,
				product: {
					name: this.selectedProduct
				},
				batch: {
					batchId: this.selectedBatch.split('/')[0],
					batchRef: this.selectedBatch.split('/')[1]
				},
				promotion: {
					name: this.promotion.name,
					price: this.price,
					group: this.promotion.group
				}
			}

			if (this.promotion.group !== "Consignment") {
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

			this.error = false;
			console.log(data);

			EventBus.addSale(data).then(response => {
				this.onAddSale(response.body);
				this.quantity = this.promotion.quantity;
				this.description = "";
			})
			.catch(response => console.log(response));
		},
		getBatchStock(batchId) {
			let batch = null;
			this.batchStocks.forEach(batchStock => {
				if (batchStock._id === batchId) {
					batch = batchStock;
				}
			});
			return batch;
		},
		getAvaliableStock(batchId) {
			let batchSummary = this.getBatchStock(batchId);
			if (batchSummary) {
				let stock = batchSummary.totalStock;
				let totalQuantity = batchSummary.totalQuantity;
				return stock - totalQuantity;
			}
			return -1;
		}
	},
	mounted() {
		let vm = this;
		$('.input-datepicker').datepicker("setDate", new Date()).on('changeDate', function(e){
			$(this).datepicker('hide');
			let changedDate = moment($(this).val(), "YYYY-MM-DD")

			var iscurrentDate = changedDate.isSame(new Date(), "day");
			if (iscurrentDate) {
				vm.saleDate = moment();
			}
			else {
				vm.saleDate = changedDate;
			}
		});
	},
	components: {
		select2: Select2
	}
}
</script>
