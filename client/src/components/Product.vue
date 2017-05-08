<template>
	<div>
		<div class="row">
			<div class="col-md-6">
				<div class="block">
					<div class="form-group" :class="{ 'has-error': productImageError }">
						<input type="text" v-model="productImage" class="form-control" placeholder="http://">
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
			this.$http.post('/api/products', { name: this.productName, link: this.productImage })
			.then(response => {
				this.products.push(response.body);
				this.productName = '';
				this.productImage = '';
			}, response => {
				console.log(response);
			});
		},
		deleteProduct(id) {

		}
	},
	created() {
		EventBus.query("{ products { _id, name, link } }")
		.then(response => this.products = response.body.data.products)
		.catch(response => console.log(response));
	}
}
</script>
