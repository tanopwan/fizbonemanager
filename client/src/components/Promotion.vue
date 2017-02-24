<template>
	<div>
		<div class="row">
			<div class="col-xs-6" v-for="product, index in products">
				<div class="block full">
					<div class="block-title">
						<h2>{{ product.name }}</h2>
					</div>
					<div class="row form-group">
						<div class="col-sm-6">
							<select2 :options="batchOptions[index]" v-model="addPromotions[index].batchId" placeholder="เลือก Batch...">
							</select2>
						</div>
						<div class="col-sm-6">
							<div class="input-group">
								<span class="input-group-addon"><i class="fa fa-sort"></i></span>
								<input type="number" class="form-control" v-model="addPromotions[index].quantity" placeholder="จำนวนเริ่มต้น">
							</div>
						</div>
					</div>
					<div class="row form-group">
						<div class="col-sm-12">
							<div class="input-group">
								<input type="number" class="form-control" v-model="addPromotions[index].price" placeholder="ราคา">
								<span class="input-group-addon">&#x0E3F;</span>
								<input type="text" class="form-control" v-model="addPromotions[index].name" placeholder="Name">
								<span class="input-group-btn">
									<button type="button" @click="addPromotion(index)" class="btn btn-effect-ripple btn-success" style="overflow: hidden; position: relative;">Add</button>
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
							All Promotions <small> Total: {{ promotions.length }}</small>
						</h4>
					</div>
					<div class="row">
						<div class="col-xs-12">
							<template v-for="promotion in promotions">
								<div>
									<div class="pull-right">
										{{ promotion._id }}
										<button class="btn btn-danger" @click="deletePromotion(promotion._id)"><i class="fa fa-minus"></i></button>
									</div>
									<h4 class="sub-header">
										{{ promotion.name }} <small> Batch: {{ promotion.batchId }}</small>
									</h4>
								</div>
								<div>
									&#x0E3F; {{ promotion.price / 100 }}
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { EventBus } from '../bus';
import Select2 from './basic/Select2.vue'

export default {
	data() {
		return {
			batches: [],
			products: [],
			promotions: [],
			addPromotions: []
		};
	},
	methods: {
		addPromotion(index) {
			let promo = {
				name: this.addPromotions[index].name,
				price: this.addPromotions[index].price,
				batchId: this.addPromotions[index].batchId,
				quantity: this.addPromotions[index].quantity
			};
			this.$http.post('/api/promotions', promo).then(response => {
				this.promotions.push(response.body);
			}).catch(response => console.log(response));
		},
		deletePromotion(id) {
			this.$http.delete('/api/promotions/' + id).then(response => {
				let index = -1;
				this.promotions.forEach((promotion, idx) => {
					if (promotion._id === id) {
						index = idx;
					}
				});
				if (index !== -1) {
					this.promotions.splice(index, 1);
				}
			}, response => {
				console.log(response);
			});
		}
	},
	computed: {
		batchOptions: function() {
			let batchOptions = [];
			this.products.forEach(product => {
				var options = [];
				this.batches.filter(batch => {
					return batch.productId === product._id;
				}).forEach(batch => {
					options.push({ id: batch._id, text: batch.batchRef });
				});
				batchOptions.push(options);
			});
			return batchOptions;
		}
	},
	created() {
		EventBus.getProducts()
			.then(response => {
				this.products = response.body
				this.products.forEach(product => {
					this.addPromotions.push({ productId: product._id });
				})
			})
			.catch(response => console.log(response));
		EventBus.getBatches()
			.then(response => this.batches = response.body)
			.catch(response => console.log(response));
		EventBus.getPromotions()
			.then(response => this.promotions = response.body)
			.catch(response => console.log(response));
	},
	components: {
		'select2': Select2
	}
}

</script>
