import Vue from 'vue';

// let pageAccessTokenPromise = new Promise((resolve, reject) => {
// 	Vue.http.get('/api/users/page').then(response => {
// 		console.log(response.data.page.access_token);
// 		resolve(response.data.page.access_token);
// 	});
// });

export const EventBus = new Vue({
	data: {
		productURL: '/api/products',
		batchURL: '/api/batches',
		saleURL: '/api/sales',
		promotionURL: '/api/promotions',
		customerURL: '/api/customers',
		// pageAccessToken: null,
		// pageAccessTokenPromise: pageAccessTokenPromise,
	},
	methods: {
		expireCache(key) {
			localStorage.removeItem(`CACHE_${key}`);
		},
		query(query) {
			return this.$http.post('/graphql', { "query": `${query}` });
		},
		getProducts() {
			return this.$http.get(`${this.productURL}`);
		},
		getProductsWithBatches() {
			return this.$http.get(`${this.productURL}/batches`);
		},
		getAllProductsWithBatches() {
			return this.$http.get(`${this.productURL}/batches?all=true`);
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
				return this.$http.get(`${this.saleURL}?group=Consignment&includeBilledSales=false`);
			}
			else {
				return this.$http.get(`${this.saleURL}?group=Consignment&limit=${parseInt(limit)}`);
			}
		},
		getPromotions(param) {
			if (param) {
				return this.$http.get(`${this.promotionURL}${param}`);
			}
			return this.$http.get(`${this.promotionURL}`);
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
		},
		// getPageAccessToken() {
		// 	if (pageAccessToken) {
		// 		return Promise.resolve(pageAccessToken);
		// 	}

		// 	return pageAccessTokenPromise.then(accessToken => {
		// 		this.pageAccessToken = accessToken;
		// 		return Promise.resolve(accessToken);
		// 	});
		// }
	}
});
