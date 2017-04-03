<template>
	<div>
		<div class="row">
			<div class="col-md-6 col-xs-12">
				<div class="block">
					<div class="row form-group">
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
					<div class="row form-group">
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
								{{ batch.batchRef }} <small>{{ getProductById(batch.productId).name }}</small>
							</h4>
						</div>
						<div>
							จำนวน {{ batch.quantity }}
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
			batchRef: '',
			quantity: 0,
			batches: [],
			products: [],
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
		getProductById(id) {
			let foundProduct = null;
			this.products.forEach(product => {
				if (product._id === id) {
					foundProduct = product;
				}
			});
			return foundProduct;
		},
		addBatch() {
			let body = {
				batchRef: `${this.batchRefPrefix}_${this.batchRef}`,
				productId: $('.select-select2').val(),
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
		}
	},
	created() {
		EventBus.query("{ products { _id, name } }")
			.then(response => this.products = response.body.data.products)
			.catch(response => console.log(response));
		EventBus.getBatches()
			.then(response => this.batches = response.body)
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
