import Vue from 'vue';

export const EventBus = new Vue({
	data: {
		productURL: '/api/products',
		batchURL: '/api/batches',
		saleURL: '/api/sales',
		promotionURL: '/api/promotions',
		consignmentURL: '/api/consignments'
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
		getConsignments(limit) {
			if (isNaN(parseInt(limit))) {
				return this.$http.get(this.consignmentURL);
			}
			else {
				return this.$http.get(`${this.consignmentURL}?limit=${parseInt(limit)}`);
			}
		},
		getPromotions() {
			return this.$http.get(this.promotionURL);
		},
		getConsignments() {
			return this.$http.get(this.consignmentURL);
		},
		addSale(data) {
			return this.$http.post(this.saleURL, data);
		},
		addConsignment(data) {
			return this.$http.post(this.consignmentURL, data);
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
