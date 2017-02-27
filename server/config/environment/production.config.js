module.exports = {
	facebook: {
		clientID: '',
		clientSecret: '',
		callbackURL: `${process.env.DOMAIN}:${process.env.PORT}/api/auth/facebook/callback`
	},
	mongo: {
		uri: 'mongodb://fizbonemanager:fizadmin@ds157819.mlab.com:57819/heroku_w1b98w1f',
		options: {
            db: {
                safe: true
            }
        },
		jwt: 'abc'
	}
}
