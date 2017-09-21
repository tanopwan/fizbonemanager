<template>
	<div>
		<div class="row">
			<div class="col-md-12">
				<div class="block full">
					<div class="block-title">
						<h4>
							All Online Products <small> Total: {{ products.length }}</small>
						</h4>
					</div>
					<template v-for="product in products">
						<div>
							<h4 class="header">
								{{ product._id }}
							</h4>
							<h4 class="sub-header">
								ราคา {{ (product.price / 100).toFixed(2) }}
							</h4>
							<img v-if="product.link" :src="product.link" width="300px">
							<code>batchId: {{ product.batchId }}</code>
							<code>promotionId: {{ product.promotionId }}</code>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			products: []
		};
	},
	methods: {
		deleteProduct(id) {

		}
	},
	created() {
		this.$http.get('/api/products/online').then(response => {
			this.products = response.body;
		});
	}
}
</script>
