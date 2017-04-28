<template>
	<div>
		<div class="row">
			<div class="col-md-6">
				<div class="block">
					<div class="form-group">
						<div class="input-group">
							<input type="text" v-model="productName" class="form-control" placeholder="Product Name">
							<span class="input-group-btn">
								<button type="button" @click="addProduct" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
							</span>
						</div>
					</div>
					<div class="form-group">
						<input type="text" v-model="productImage" class="form-control" placeholder="http://">
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
			products: []
		};
	},
	methods: {
		addProduct() {
			EventBus.addProduct({ name: this.productName, link: this.productImage })
				.then(response => {
					this.products.push(response.body);
				}, response => {
					console.log(response);
				});
		},
		deleteProduct(id) {
			EventBus.query(`mutation { deleteProduct(_id: "${ id }") { ok, n } }`)
				.then(response => {
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
