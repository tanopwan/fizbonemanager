<template>
	<div>
		<div class="row">
			<div class="col-md-6 col-xs-12">
				<div class="block">
					<div class="row form-group" :class="{ 'has-error': quantityError }">
						<div class="col-sm-6">
							<div class="input-group">
								<span class="input-group-addon">จำนวน</span>
								<input type="text" v-model="quantity" class="form-control" placeholder="จำนวน">
							</div>
						</div>
						<div class="col-sm-6">
							<select id="example-select2" class="select-select2" style="width: 100%;" data-placeholder="Choose Product..">
								<option></option><!-- Required for data-placeholder attribute to work with Select2 plugin -->
								<option v-for="product in products" :value="product._id">{{ product.name }}</option>
							</select>
						</div>
					</div>
					<div class="row form-group" :class="{ 'has-error': batchNameError }">
						<div class="col-sm-12">
							<div class="input-group">
								<input type="text" class="form-control input-group-addon input-datepicker" data-date-format="yyyy-mm-dd" placeholder="dd-mm-yyyy">
								<span class="input-group-addon"><i class="fa fa-window-minimize"></i></span>
								<input type="text" class="form-control" v-model="batchRef" placeholder="Batch Ref.">
								<span class="input-group-btn">
									<button type="button" @click="addBatch" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
								</span>
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
							All Batches <small> Total: {{ batches.length }}</small>
						</h4>
					</div>
					<template v-for="batch in sortedBatches">
						<div>
							<div class="pull-right">
								{{ batch._id }}
								<button class="btn btn-danger" @click="deleteBatch(batch._id)"><i class="fa fa-minus"></i></button>
							</div>
							<h4 class="sub-header">
								{{ batch.batchRef }} <small>{{ batch.product.name }}</small>
							</h4>
						</div>
						<div>
							จำนวน {{ batch.quantity }}
						</div>
						<p>
							<a href="javascript:void(0)" @click="setIsFinish(batch._id, !batch.isFinish)" class="label" :class="{ 'label-success': !batch.isFinish, 'label-default': batch.isFinish}">{{ batch.isFinish ? 'ขายหมด' : 'มีสินค้าขาย' }}</a>
						</p>
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
			batchRef: '',
			quantity: 0,
			batches: [],
			products: [],
			quantityError: false,
			batchNameError: false,
			batchRefPrefix: ''
		};
	},
	computed: {
		sortedBatches: function() {
			let sorted = this.batches.sort(function(s1, s2){
				let isAfter = moment(s1.updatedAt).isAfter(s2.updatedAt);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
			return sorted;
		}
	},
	methods: {
		addBatch() {
			let productId = $('.select-select2').val();
			let product = this.products.find(product => product._id === productId);
			this.batchNameError = false;
			this.quantityError = false;

			if (this.quantity < 1) {
				this.quantityError = true;
				return;
			}

			if (!this.batchRef) {
				this.batchNameError = true;
				return;
			}

			if (!productId) {
				return;
			}

			let body = {
				batchRef: `${this.batchRefPrefix}_${this.batchRef}`,
				product: {
					name: product.name,
					link: product.link,
					barcode: product.barcode,
					productCode: product.productCode,
				},
				quantity: this.quantity
			}
			this.$http.post('/api/batches', body).then(response => {
				this.batches.push(response.body);
			}, response => {
				console.log(response);
			});
		},
		deleteBatch(id) {
			this.$http.delete('/api/batches/' + id).then(response => {
				let index = -1;
				this.batches.forEach((batch, idx) => {
					if (batch._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.batches.splice(index, 1);
				}
			}, response => {
				console.log(response);
			});
		},
		setIsFinish(id, isFinish) {
			this.$http.put(`/api/batches/${id}/finish/${isFinish}`).then(response => {
				this.batches.forEach((batch, idx) => {
					if (batch._id === id) {
						batch.isFinish = isFinish;
					}
				});
			}, response => {
				console.log(response);
			});
		},
	},
	created() {
		EventBus.getProducts()
			.then(response => {
				this.products = response.body;
				console.log(this.products);
			})
			.catch(response => console.log(response));
		EventBus.getBatches()
			.then(response => {
				this.batches = response.body;
			})
			.catch(response => console.log(response));
	},
	mounted() {
		$('.select-select2').select2();
		let vm = this;
		$('.input-datepicker').datepicker("setDate", new Date()).on('changeDate', function(e){
			$(this).datepicker('hide');
			vm.batchRefPrefix = $(this).val();
		});
		this.batchRefPrefix = $('.input-datepicker').val();
	}
}

</script>
