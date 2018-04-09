'use strict';

const express = require('express');
const passport = require('passport');

const auth = require('../../auth');
const config = require('../../config/environment');

const router = express.Router();

router.get('/', passport.authenticate('facebook', {
	scope: [
		'email',
		'manage_pages',
		'read_page_mailboxes',
		'pages_messaging',
	],
	failureRedirect: '/signup',
	session: false
})).get('/callback', passport.authenticate('facebook', {
	failureRedirect: '/signup',
	session: false
}), (req, res) => {
	if(!req.user) {
		return res.status(404).send('It looks like you aren\'t logged in, please try again.');
	}
	res.cookie('jwt-app', auth.sign(req.user));
	res.redirect('/');
});

module.exports = router;
