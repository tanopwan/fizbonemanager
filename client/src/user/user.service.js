
import Vue from 'vue';
import Promise from 'promise';

var userAsync = null;

const cookieName = 'jwt-app';

const getCookieByName = (name) => {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
};

export default {
	getCurrentUser: function() {
		if(getCookieByName(cookieName)) {
			localStorage.setItem('session', getCookieByName(cookieName));

			if (!userAsync) {
				userAsync = new Promise(function(resolve, reject) {
					Vue.http.get('/api/users/me').then(function(response) {
						let me = Object.assign({}, response.body);
						return Vue.http.get('/api/users/page').then(response => {
							me.pages = response.data;
							resolve(me);
						})
					}).catch(function(error) {
						reject(error);
					});
				})
			}
			return userAsync;
		}
		else {
			return Promise.reject({message: "cookie not found!"});
		}
	},
	logout: function(cb) {
		Vue.http.get('/api/users/logout').then(response => {
			// TODO
			console.log(response);
			cb(false);
		}, response => {
			// TODO
			console.log(response);
			cb(true);
		});
	}
};
