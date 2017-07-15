<template>
	<div>
		<div class="row">
			<div class="col-xs-12 col-sm-6 col-md-4">
				<promotion-widget :productsWithBatches="productsWithBatches" v-on:addPromotion="onAddPromotion"></promotion-widget>
			</div>
			<div class="col-xs-12 col-sm-6 col-md-4" v-for="promotion in sortedPromotions">
				<promotion-widget :productsWithBatches="productsWithBatches" :promotion="promotion"></promotion-widget>
			</div>
		</div>
	</div>
</template>

<script>
import { EventBus } from '../bus'
import moment from 'moment';
import PromotionWidget from './PromotionWidget.vue';

export default {
	data() {
		return {
			productsWithBatches: [],
			promotions: []
		};
	},
	methods: {
		onAddPromotion(promotion) {
			this.promotions.push(promotion);
		}
	},
	computed: {
		sortedPromotions: function() {
			let sorted = this.promotions.sort(function(s1, s2){
				let isAfter = moment(s1.createdAt).isAfter(s2.createdAt);
				if (isAfter) {
					return -1;
				}
				return 1;
			});
			return sorted;
		}
	},
	created() {
		EventBus.getProductsWithBatches()
		.then(response => {
			this.productsWithBatches = response.body;
		})
		.catch(response => console.log(response));
		EventBus.getPromotions()
		.then(response => this.promotions = response.body)
		.catch(response => console.log(response));
	},
	components: {
		'PromotionWidget': PromotionWidget
	}
}

</script>
