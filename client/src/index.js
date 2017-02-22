import Vue from 'vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import App from './App.vue';

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.interceptors.push((request, next) => {
	request.headers.set('x-access-token', localStorage.getItem('session'));
	request.headers.set('Accept', 'application/json');
	next(function(response) {
		if (response.status === 401) {
			console.log("You need to login => redirect");
			location.href = '/login';
		}
	});
});

import routes from './routes';

new Vue({
	el: '#app',
	render: h => h(App),
	router: new VueRouter({
		mode: 'history',
		routes
	})
});
