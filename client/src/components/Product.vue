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
							All Products <small> Total: {{ products.length }}</small>
						</h4>
					</div>
					<template v-for="product in products">
						<div>
							<div class="pull-right">
								<code>productId: {{ product._id }}</code>
								<button class="btn btn-danger" @click="deleteProduct(product._id)"><i class="fa fa-minus"></i></button>
							</div>
							<h4 class="sub-header">
								{{ product.name }}
							</h4>
							<img :src="product.link" width="300px">
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
			productName: '',
			productImage: '',
			productCode: '',
			barcode: '',
			keywords: '',
			products: [],
			productNameError: false,
			productImageError: false
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
		}
	},
	created() {
		EventBus.query("{ products { _id, name, link } }")
		.then(response => this.products = response.body.data.products)
		.catch(response => console.log(response));
	}
}
</script>
