<template>
	<div>
		<a href="#edit-sale-modal" @click="openEditSale(sale._id)" class="btn btn-warning" data-toggle="modal" style="overflow: hidden; position: relative;">
			<i class="fa fa-money"></i>
		</a>
		<div id="edit-sale-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title"><strong>Sale</strong></h3>
					</div>
					<div class="modal-body">
						<date-time-picker update="false" v-on:input="onDatetime"></date-time-picker>
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
	</div>
</template>

<script>
import { EventBus } from '../bus';

export default {
	props: ['sale'],
	data() {
		return {
			promotions: [],
			productWithBatches: [],
			selectedPromotion: '',
			selectedBatch: '',
			datetime: null
		}
	},
	methods: {
		openEditSale(id) {

		},
		onDatetime(value) {
			this.datetime = value;
		},
	},
	computed: {
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
	}
}
</script>
