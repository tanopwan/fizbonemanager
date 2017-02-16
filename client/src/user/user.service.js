
import Vue from 'vue';
import Promise from 'promise';
import config from '../../../server/config/environment'

const userAsync = null;

const getCookieByName = (name) => {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
};

export default {
	getCurrentUser: function() {
		if(getCookieByName(config.cookieName)) {
			localStorage.setItem('session', getCookieByName(config.cookieName));

			if (!userAsync) {
				userAsync = new Promise(function(resolve, reject) {
					Vue.http.get('/api/users/me').then(function(response) {
						let me = Object.assign({}, response.body);
						console.log(me);
						resolve(me);
					}).catch(function(response) {
						reject(response);
					});
				});
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
