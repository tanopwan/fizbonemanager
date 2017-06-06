<template>
	<div class="widget">
		<div class="widget-content text-light-op" :class="[{'themed-background': promotion && !isDeleted}, {'themed-background-dark': promotion && isDeleted}, {'themed-background-success': !promotion}]">
			<span v-if="promotion">Promotion</span>
			<span v-else>Add New</span>
		</div>
		<div class="widget-content themed-background-muted text-center">
			<div class="row form-group">
				<div class="col-xs-12">
					<input type="text" class="form-control" v-model="name" placeholder="ชื่อโปรโมชั่น">
				</div>
			</div>
			<div class="row form-group">
				<div class="col-xs-12">
					<div class="input-group">
						<span class="input-group-addon">จำนวน</span>
						<input type="number" class="form-control" v-model="quantity" placeholder="จำนวนเริ่มต้น">
						<span class="input-group-addon">&#x0E3F;</span>
						<input type="number" class="form-control" v-model="priceBaht" placeholder="ราคา">
					</div>
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
			<div class="row form-group">
				<div class="col-xs-12">
					<select2 :options="groups" v-model="selectedGroup" allowClear="false">
					</select2>
				</div>
			</div>
			<div class="row form-group">
				<div class="col-xs-12">
					<i v-if="saving" class="fa fa-asterisk fa-2x fa-spin text-success"></i>
					<div v-else class="input-group">
						<span v-if="!(success || error)" class="input-group-btn">
							<button v-if="promotion" type="button" @click="remove" class="btn btn-warning" style="overflow: hidden; position: relative;">Remove</button>
							<button v-if="promotion" type="button" @click="save" class="btn btn-success" style="overflow: hidden; position: relative;">Save</button>
							<button v-else type="button" @click="save" class="btn btn-success" style="overflow: hidden; position: relative;">Add</button>
						</span>
						<span v-if="(success || error)" class="input-group-btn">
							<button v-if="success" type="button" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">
								<i class="fa fa-fw fa-check-circle"></i> Success
							</button>
							<button v-if="error" type="button" class="btn btn-effect-ripple btn-danger" style="overflow: hidden; position: relative;">
								<i class="fa fa-fw fa-check-circle"></i> Error
							</button>
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Select2 from './basic/Select2.vue';

export default {
	props: ['promotion', 'productsWithBatches'],
	data() {
		return {
			saving: false,
			success: false,
			error: false,
			isDeleted: false,

			name: this.promotion ? this.promotion.name : '',
			quantity: this.promotion ? this.promotion.quantity : 0,
			priceBaht: this.promotion ? this.promotion.price / 100 : 0,
			selectedProduct: this.promotion && this.promotion.product ? this.promotion.product.name : '',
			selectedBatch: this.promotion && this.promotion.batch ? this.promotion.batch.batchId + '/' + this.promotion.batch.batchRef : '',
			selectedGroup: this.promotion ? this.promotion.group : 'Booth',

			groups: [
				{ id: "Booth", text: "Booth" },
				{ id: "Online", text: "Online" },
				{ id: "Consignment", text: "Consignment" },
				{ id: "Special", text: "Special" },
				{ id: "Sponsor", text: "Sponsor" },
				{ id: "Wholesale", text: "Wholesale" }
			]
		}
	},
	computed: {
		price() {
			return this.priceBaht * 100;
		},
		productOptions() {
			let options = [];
			console.log(this.productsWithBatches);
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
	watch: {
		promotion(promotion) {
			if (promotion) {
				this.name = promotion.name || '';
				this.quantity = promotion.quantity || 0;
				this.priceBaht = promotion.price / 100 || 0;
				this.selectedProduct = promotion ? promotion.product.name : '';
				this.selectedBatch = promotion ? promotion.batch.batchId + '/' + promotion.batch.batchRef : '';
				this.selectedGroup = promotion.group || 'Booth';
			}
		}
	},
	methods: {
		save() {
			this.saving = true;
			this.success = false;
			this.error = false;

			let promotion = {
				name: this.name,
				quantity: this.quantity,
				price: this.price,
				product: {
					name: this.selectedProduct
				},
				batch: {
					batchId: this.selectedBatch.split('/')[0],
					batchRef: this.selectedBatch.split('/')[1]
				},
				group: this.selectedGroup
			};

			if (this.promotion && this.promotion._id) {
				// Update
				this.$http.post('/api/promotions/' + this.promotion._id, promotion).then(response => {
					this.success = true;
					this.saving = false
					setTimeout(() => {
						this.success = false;
					}, 2000);
				}).catch(response => {
					console.log(response);
					this.saving = false
					this.error = true;
				});
			}
			else {
				// Save new
				this.$http.post('/api/promotions', promotion).then(response => {
					this.success = true;
					this.saving = false

					this.name = '';
					this.quantity = 0;
					this.priceBaht = 0;
					this.selectedProduct = '';
					this.selectedBatch = '';
					this.selectedGroup = 'Booth';
					setTimeout(() => {
						this.success = false;
						this.$emit('addPromotion', response.body);
					}, 1000);
				}).catch(response => {
					console.log(response);
					this.saving = false
					this.error = true;
				});
			}
		},
		remove() {
			this.$http.delete('/api/promotions/' + this.promotion._id).then(response => {
				console.log(response);
				this.isDeleted = true;
			}).catch(response => {
				console.log(response);
			});
		}
	},
	components: {
		'Select2': Select2
	}
}
</script>
