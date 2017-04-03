module.exports = {
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
	}
}
