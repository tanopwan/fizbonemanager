<template>
	<div>
		<div class="block">
			<div class="row form-group">
				<div class="col-md-6">
					<div class="input-group">
						<input type="text" v-model="productName" class="form-control" placeholder="Product Name">
						<span class="input-group-btn">
							<button type="button" @click="addProduct" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
						</span>
					</div>
				</div>
			</div>
		</div>
		<div class="block full">
			<div class="block-title">
				<h2>
					All Products
				</h2>
			</div>
			<template v-for="product in products">
				<h4 class="sub-header">
					{{ product.name }}
				</h4>
				<div>
					<button class="btn btn-danger" @click="deleteProduct(product._id)"><i class="fa fa-minus"></i></button>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				productName: '',
				products: []
			};
		},
		methods: {
			addProduct() {
				this.$http.post('/api/products', { name: this.productName }).then(response => {
					this.products.push(response.body);
				}, response => {
					// TODO
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
			},
			getProducts() {
				this.$http.get('/api/products').then(response => {
					this.products = response.body;
				}, response => {
					console.log(response);
				});
			}
		},
		created() {
			this.getProducts();
		}
	}
</script>

<style>
</style>
