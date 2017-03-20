import Vue from 'vue';

export const EventBus = new Vue({
	data: {
		productURL: '/api/products',
		batchURL: '/api/batches',
		saleURL: '/api/sales',
		promotionURL: '/api/promotions',
		customerURL: '/api/customers'
	},
	methods: {
		getProducts() {
			return this.$http.get(this.productURL);
		},
		getProductsWithBatches() {
			return this.$http.get(`${this.productURL}/batches`);
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
		getConsignments(limit) {
			if (isNaN(parseInt(limit))) {
				return this.$http.get(`${this.saleURL}?consignment=true`);
			}
			else {
				return this.$http.get(`${this.saleURL}?consignment=true&limit=${parseInt(limit)}`);
			}
		},
		getPromotions() {
			return this.$http.get(this.promotionURL);
		},
		getCustomers() {
			return this.$http.get(this.customerURL);
		},
		addSale(data) {
			return this.$http.post(this.saleURL, data);
		},
		getBatchStock(id) {
			if (id) {
				return this.$http.get(`${this.batchURL}/stock/${id}`);
			}
			else {
				return this.$http.get(`${this.batchURL}/stock`);
			}
		},
		getSaleSummary() {
			return this.$http.get(`${this.saleURL}/summary`);
		}
	}
});
