'use strict';

let name = 'fizbonemanager';

module.exports = {
	// Facebook App: Fizbone Manager
	facebook: {
		clientID: '397434167256284',
		clientSecret: '678889f126b6e75e1b1ee1c011e53e4d',
		callbackURL: `http://localhost:3080/api/auth/facebook/callback`
	},
	mongo: {
		uri: `mongodb://localhost/${name}`,
		options: {
            db: {
                safe: true
            }
        }
	},
	jwt: 'superSecret',
	authorizedEmails: ['tanopwan@hotmail.com', 't_thanapon@hotmail.com', 'noolizaa@hotmail.com'],
	PAGE_ACCESS_TOKEN: 'EAAFpdtpcZANwBAEo7F5dEX1Tu7fyBigoxDsaRbZCqNNyedZAyZCbtijWVvYPaQllfoQp5SrYFPip4h8R2lg5oWcShf7NsBCp9qAELZA792fOQS2qSIpvn3KlxTVd4eyCf8UueFaQc7573AOdTXdlV02VdU41eNQI6MILffTcPHAZDZD',
	PAGE_SECRET: '678889f126b6e75e1b1ee1c011e53e4d',
	page_id: '410003622672111',
}
