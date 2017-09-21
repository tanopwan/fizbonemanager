<template>
	<div>
		<div class="row">
			<div class="col-md-6">
				<div class="block">
					<div class="form-group" :class="{ 'has-error': productImageError }">
						<div class="input-group">
							<span class="input-group-addon">Product Code</span>
							<input type="text" v-model="productCode" class="form-control" placeholder="FZxxA">
							<span class="input-group-addon">Barcode</span>
							<input type="text" v-model="barcode" class="form-control" placeholder="88594037">
						</div>
					</div>
					<div class="form-group" :class="{ 'has-error': productImageError }">
						<input type="text" v-model="productImage" class="form-control" placeholder="http://">
					</div>
					<div class="form-group">
						<div class="input-group">
							<span class="input-group-addon">keywords</span>
							<input type="text" v-model="keywords" class="form-control">
						</div>
					</div>
					<div class="form-group" :class="{ 'has-error': productNameError }">
						<div class="input-group">
							<input type="text" v-model="productName" class="form-control" placeholder="Product Name">
							<span class="input-group-btn">
								<button type="button" @click="addProduct" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="block full">
					<div class="block-title">
						<h4>
							All Products
							<small> Total: {{ products.length }}</small>
						</h4>
					</div>
					<table id="general-table" class="table table-vcenter table-borderless table-condensed table-hover">
						<thead>
							<tr>
								<th>Id</th>
								<th></th>
								<th>Product Code</th>
								<th>Barcode</th>
								<th>Name</th>
								<th>Description</th>
								<th style="width: 120px;" class="text-center">
									<i class="fa fa-flash"></i>
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="product in products" v-bind:key="product._id">
								<td>{{ product._id }}</td>
								<td>
									<img :src="product.link" width="300px">
								</td>
								<td>{{ product.productCode }}</td>
								<td>{{ product.barcode }}</td>
								<td>{{ product.name }}</td>
								<td>{{ product.description }}</td>
								<td class="text-center">
									<a href="#show-product-modal" @click="showProductModal(product._id)" data-toggle="modal" class="btn btn-effect-ripple btn-sm btn-success" style="overflow: hidden; position: relative;">
										<i class="fa fa-pencil"></i>
									</a>
									<a href="javascript:void(0)" @click="deleteProduct(product._id)" class="btn btn-effect-ripple btn-sm btn-danger" style="overflow: hidden; position: relative;">
										<i class="fa fa-times"></i>
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div id="show-product-modal" class="modal" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
						<h3 class="modal-title">
							<strong>Product </strong>
							<small></small>
						</h3>
					</div>
					<div class="modal-body">
						<pre ref="productStringEditor" style="background-color: #f5f5f5;" contenteditable="true"></pre>
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
			productName: '',
			productImage: '',
			productCode: '',
			barcode: '',
			keywords: '',
			products: [],
			productNameError: false,
			productImageError: false,
			productString: '{}',
			saving: false,
		};
	},
	methods: {
		addProduct() {
			if (!this.productName) {
				this.productNameError = true;
				return;
			}
			if (!this.productImage) {
				this.productImageError = true;
				return;
			}
			this.productNameError = false;
			this.productImageError = false;

			let data = {
				name: this.productName,
				link: this.productImage,
				productCode: this.productCode,
				barcode: this.barcode,
				keywords: this.keywords.split(' '),
			}

			this.$http.post('/api/products', data)
				.then(response => {
					this.products.push(response.body);
					this.productName = '';
					this.productImage = '';
					this.productCode = '';
					this.barcode = '';
					this.keywords = '';
				}, response => {
					console.log(response);
				});
		},
		save() {
			this.saving = true;
			this.productString = $(this.$refs.productStringEditor).text();
			console.log(this.productString);
			try {
				let product = JSON.parse(this.productString);

				let vm = this;
				let id = product._id;
				this.$http.post('/api/products/' + id, product).then(response => {
					let index = -1;
					vm.products.forEach((product, idx) => {
						if (product._id === id) {
							index = idx;
						}
					});
					if (index !== -1) {
						vm.products[index] = response.data;
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
		deleteProduct(id) {
			this.$http.delete('/api/products/' + id).then(response => {
				let index = -1;
				this.products.forEach((product, idx) => {
					if (product._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.products.splice(index, 1);
				}
			}, response => {
				console.log(response);
			});
		},
		showProductModal(id) {
			let product = this.products.find(product => product._id === id);
			if (product) {
				this.productString = JSON.stringify(product, null, 4);
				$(this.$refs.productStringEditor).text(this.productString);
			}
			else {
				this.productString = `{ \"error\": \"product._id ${id} is not found.\" }`;
			}
		},
	},
	created() {
		EventBus.getProducts()
			.then(response => this.products = response.body)
			.catch(response => console.log(response));
	}
}
</script>
