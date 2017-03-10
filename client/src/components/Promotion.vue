<template>
	<div>
		<div class="row">
			<div class="col-xs-12 col-sm-6" v-for="product, index in products">
				<div class="block full">
					<div class="block-title">
						<h2>{{ product.name }}</h2>
					</div>
					<div class="row form-group">
						<div class="col-xs-12">
							<select2 :options="batchOptions[index]" v-model="addPromotions[index].batchId" placeholder="เลือก Batch...">
							</select2>
						</div>
					</div>
					<div class="row form-group">
						<div class="col-xs-6">
							<div class="input-group">
								<span class="input-group-addon"><i class="fa fa-sort"></i></span>
								<input type="number" class="form-control" v-model="addPromotions[index].quantity" placeholder="จำนวนเริ่มต้น">
							</div>
						</div>
						<div class="col-xs-6">
							<div class="input-group">
								<label class="csscheckbox csscheckbox-info">
									<input type="checkbox" v-model="addPromotions[index].isBilled"> <span> </span> ขายขาด
								</label>
							</div>
						</div>
					</div>
					<div class="row form-group">
						<div class="col-xs-12">
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
							<template v-for="promotion in sortedPromotions">
								<div>
									<div class="pull-right">
										<small>{{ promotion._id }}</small>
										<button class="btn btn-danger" @click="deletePromotion(promotion._id)"><i class="fa fa-minus"></i></button>
									</div>
									<h4 class="sub-header">
										{{ promotion.name }}
									</h4>
								</div>
								<p>
									<a href="javascript:void(0)" @click="setIsActive(promotion._id, !promotion.isActive)" class="label" :class="{ 'label-default': !promotion.isActive, 'label-success': promotion.isActive}">{{ promotion.isActive ? 'Active' : 'InActive' }}</a>
									<a href="javascript:void(0)" @click="setIsBilled(promotion._id, !promotion.isBilled)" class="label" :class="{ 'label-primary': !promotion.isBilled, 'label-info': promotion.isBilled}">{{ promotion.isBilled ? 'ขายขาด' : 'ฝากขาย' }}</a>

									<small> Batch: {{ promotion.batchId.batchRef }}</small>
									<h4>&#x0E3F; {{ promotion.price / 100 }}</h4>
								</p>
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
import Select2 from './basic/Select2.vue';
import moment from 'moment';

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
				quantity: this.addPromotions[index].quantity || 1,
				isBilled: this.addPromotions[index].isBilled
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
		},
		setIsActive(id, isActive) {
			this.$http.put(`/api/promotions/${id}/active/${isActive}`).then(response => {
				this.promotions.forEach((promotion, idx) => {
					if (promotion._id === id) {
						promotion.isActive = isActive;
					}
				});
			}, response => {
				console.log(response);
			});
		},
		setIsBilled(id, isBilled) {
			this.$http.put(`/api/promotions/${id}/billed/${isBilled}`).then(response => {
				this.promotions.forEach((promotion, idx) => {
					if (promotion._id === id) {
						promotion.isBilled = isBilled;
					}
				});
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
		},
		sortedPromotions: function() {
			let sorted = this.promotions.sort(function(s1, s2){
				let isAfter = moment(s1.updatedAt).isAfter(s2.updatedAt);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
			return sorted;
		}
	},
	created() {
		EventBus.getProducts()
			.then(response => {
				this.products = response.body
				this.products.forEach(product => {
					this.addPromotions.push({ productId: product._id, isBilled: true, quantity: 1 });
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
