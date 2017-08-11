import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './App.vue';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.interceptors.push((request, next) => {
	request.headers.set('x-access-token', localStorage.getItem('session'));
	request.headers.set('Accept', 'application/json');
	next(function (response) {
		if (response.status === 401) {
			console.log("You need to login => redirect");
			location.href = '/login';
		}
	});
});

let nonCacheList = ['/graphql', '/api/users/me', '/api/users/logout', '/api/sales']
Vue.http.interceptors.push((request, next) => {
	let isInNonCacheList = nonCacheList.find(url => request.url === url);
	if (request.method.toLowerCase() === 'get' && !isInNonCacheList) {
		var cache = localStorage.getItem(`CACHE_${request.url}`);

		if (cache) {
			//console.log('cache hit', request.url);
			next(request.respondWith(JSON.parse(cache), { status: 200, statusText: 'Ok' }));
		} else {
			//console.log('cache miss', request.url);
		}
	}

	next(function (response) {
		let { status, statusText, body } = response;
		if (status === 200 && request.method.toLowerCase() === 'get' && !isInNonCacheList) {
			//console.log('cache save', request.url);
			localStorage.setItem(`CACHE_${request.url}`, JSON.stringify(body));
			setTimeout(() => {
				//console.log('cache expired', request.url);
				localStorage.removeItem(`CACHE_${request.url}`)
			}, 600000);
		}
		else if (status === 200 && request.method.toLowerCase() === 'post' && !isInNonCacheList) {
			let splitUrls = request.url.substring(1).split('/');
			if (splitUrls.length > 1 && splitUrls[0] === 'api') {
				$.each(localStorage, function (key, value) {
					if (key.startsWith('CACHE_/api/' + splitUrls[1])) {
						console.log("After Post, remove cache", key);
						localStorage.removeItem(key);
					}
				});
			}
		}
		request.respondWith(body, { status, statusText });
	});
});

import routes from './routes';
import moment from 'moment';

Vue.filter('formatDate', function (value) {
	if (value) {
		return moment(String(value)).format('MM/DD/YYYY hh:mm');
	}
});

Vue.filter('fromNow', function (value) {
	if (value) {
		return moment(String(value)).fromNow();
	}
});

Vue.filter('formatBaht', function (value) {
	if (value) {
		return (value / 100).toFixed(2);
	}
});

new Vue({
	el: '#app',
	render: h => h(App),
	router: new VueRouter({
		mode: 'history',
		routes
	})
});
