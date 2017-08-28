module.exports = {
	// Facebook App: Fizbone Manager Heroku
	facebook: {
		clientID: '426640641003931',
		clientSecret: 'ef1210b58c4bf2cef39f32018f1fec96',
		callbackURL: `${process.env.DOMAIN}/api/auth/facebook/callback`
	},
	mongo: {
		uri: 'mongodb://fizbonemanager:fizadmin@ds157819.mlab.com:57819/heroku_w1b98w1f',
		options: {
            db: {
                safe: true
            }
        }
	},
	jwt: 'superSecret',
	authorizedEmails: ['tanopwan@hotmail.com', 't_thanapon@hotmail.com', 'noolizaa@hotmail.com'],
	PAGE_ACCESS_TOKEN: 'EAAFpdtpcZANwBAOrzZB6pAZCCFyQaGZA5uABX3T0Xr0EdVcjmOCElG5sxjiO3hZAAD3aTrmlJ2nhuW8cQafkkCZC7ZBjApEpp4mkkXuCpX53glOliCwFqMu8QWvOt4zaFW4hAVQA5Pva6p7ebIoXwQt69aOazBk3zjw3PrKupVX8gZDZD',
	PAGE_SECRET: '678889f126b6e75e1b1ee1c011e53e4d',
	page_id: '1461764110516142',
}
