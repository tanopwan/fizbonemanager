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
								<option v-for="product in products" :value="product._id" v-bind:key="product._id">{{ product.name }}</option>
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
					<table id="general-table" class="table table-vcenter table-borderless table-condensed table-hover">
						<thead>
							<tr>
								<th>Id</th>
								<th>Product</th>
								<th>BatchRef</th>
								<th>Quantity</th>
								<th style="width: 120px;" class="text-center">
									<i class="fa fa-flash"></i>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="batch in batches" v-bind:key="batch._id"  :class="{success: !batch.isFinish, active: batch.isFinish}">
								<td>{{ batch._id }}</td>
								<td>{{ batch.product.name }}</td>
								<td>{{ batch.batchRef }}</td>
								<td>{{ batch.quantity }}</td>
								<td class="text-center">
									<a href="#show-batch-modal" @click="showBatchModal(batch._id)" data-toggle="modal" class="btn btn-effect-ripple btn-sm btn-success" style="overflow: hidden; position: relative;">
										<i class="fa fa-pencil"></i>
									</a>
									<a href="javascript:void(0)" @click="deleteBatch(batch._id)" class="btn btn-effect-ripple btn-sm btn-danger" style="overflow: hidden; position: relative;">
										<i class="fa fa-times"></i>
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div id="show-batch-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title">
							<strong>Batch </strong>
							<small></small>
						</h3>
					</div>
					<div class="modal-body">
						<pre ref="batchStringEditor" style="background-color: #f5f5f5;" contenteditable="true"></pre>
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
import { EventBus } from 'src/bus';

export default {
	data() {
		return {
			batchRef: '',
			quantity: 0,
			batches: [],
			products: [],
			quantityError: false,
			batchNameError: false,
			batchRefPrefix: '',
			saving: false,
		};
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
		save() {
			this.saving = true;
			this.batchString = $(this.$refs.batchStringEditor).text();
			try {
				let batch = JSON.parse(this.batchString);

				let vm = this;
				let id = batch._id;
				this.$http.post('/api/batches/' + id, batch).then(response => {
					let index = -1;
					vm.batches.forEach((batch, idx) => {
						if (batch._id === id) {
							index = idx;
						}
					});
					if (index !== -1) {
						vm.batches[index] = response.data;
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
		showBatchModal(id) {
			let batch = this.batches.find(batch => batch._id === id);
			if (batch) {
				this.batchString = JSON.stringify(batch, null, 4);
				$(this.$refs.batchStringEditor).text(this.batchString);
			}
			else {
				this.batchString = `{ \"error\": \"batch._id ${id} is not found.\" }`;
			}
		},
	},
	created() {
		EventBus.getProducts()
			.then(response => {
				this.products = response.body.filter(product => product.isActive);
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
