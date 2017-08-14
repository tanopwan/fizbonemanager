'use strict';

const path = require('path');
const config = require(`./${process.env.NODE_ENV}.config.js`);

module.exports = {
	env: process.env.NODE_ENV || 'development',
	root: path.normalize(`${__dirname}/../../..`),
	port: process.env.PORT || 3000,
	mongo: config.mongo,
	facebook: {
		clientID: config.facebook.clientID || 'clientID',
		clientSecret: config.facebook.clientSecret || 'clientSecret',
		callbackURL: config.facebook.callbackURL || `${process.env.DOMAIN || ''}/auth/facebook/callback`
	},
	jwt: config.jwt || 'superSecret',
	authorizedEmails: ['tanopwan@hotmail.com', 't_thanapon@hotmail.com', 'noolizaa@hotmail.com'],
	PAGE_ACCESS_TOKEN: 'EAAFpdtpcZANwBAOrzZB6pAZCCFyQaGZA5uABX3T0Xr0EdVcjmOCElG5sxjiO3hZAAD3aTrmlJ2nhuW8cQafkkCZC7ZBjApEpp4mkkXuCpX53glOliCwFqMu8QWvOt4zaFW4hAVQA5Pva6p7ebIoXwQt69aOazBk3zjw3PrKupVX8gZDZD',
	PAGE_SECRET: process.env.PAGE_SECRET || '678889f126b6e75e1b1ee1c011e53e4d',
	page_id: config.page_id || '410003622672111',
}
