import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.http.interceptors.push((request, next) => {
	request.headers.set('x-access-token', localStorage.getItem('session'));
	request.headers.set('Accept', 'application/json');
	next();
})

new Vue({
	el: '#app',
	render: h => h(App),
	router: new VueRouter({
		mode: 'history',
		routes
	})
});
