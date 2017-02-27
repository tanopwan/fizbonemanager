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
		getSales(limit) {
			if (isNaN(parseInt(limit))) {
				return this.$http.get(this.saleURL);
			}
			else {
				return this.$http.get(`${this.saleURL}?limit=${parseInt(limit)}`);
			}
		},
		getPromotions() {
			return this.$http.get(this.promotionURL);
		},
		addSale(data) {
			return this.$http.post(this.saleURL, data);
		},
		getBatchStock(id) {
			return this.$http.get(`${this.batchURL}/stock`);
		},
		getSaleSummary() {
			return this.$http.get(`${this.saleURL}/summary`);
		}
	}
});
