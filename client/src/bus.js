import Vue from 'vue';

export const EventBus = new Vue({
	data: {
		productURL: '/api/products',
		batchURL: '/api/batches',
		saleURL: '/api/sales',
		promotionURL: '/api/promotions'
	},
	methods: {
		getProducts() {
			return this.$http.get(this.productURL);
		},
		getBatches() {
			return this.$http.get(this.batchURL);
		},
		getSales() {
			return this.$http.get(this.saleURL);
		},
		getPromotions() {
			return this.$http.get(this.promotionURL);
		},
		addSale(data) {
			return this.$http.post(this.saleURL, data);
		}
	}
});
