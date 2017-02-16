'use strict';

const path = require('path');
const config = require(`./${process.env.NODE_ENV}.config.js`);

module.exports = {
	env: process.env.NODE_ENV || 'development',
	root: path.normalize(`${__dirname}/../../..`),
	port: process.env.PORT || 3000,
	jwt: config.jwt || 'superSecret',
	mongo: config.mongo,
	facebook: {
		clientID: config.facebook.clientID || 'clientID',
		clientSecret: config.facebook.clientSecret || 'clientSecret',
		callbackURL: config.facebook.callbackURL || `${process.env.DOMAIN || ''}/auth/facebook/callback`
	},
	cookieName: 'jwt-app'
}
