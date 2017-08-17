'use strict';

const PageService = require('../../service/page.service');

const conversations = function (req, res) {
	return PageService.getConversations(req, res);
}

const idForPage = function(req, res) {
	let accessToken = req.user.providerRef.accessToken;
	let conversationUserId = req.params.id;
	return PageService.getIdForPage(conversationUserId, accessToken).then(response => {
		res.json(response);
	}).catch(error => {
		console.log(error);
		res.status(500).json(error)
	});
}

module.exports = {
	conversations,
	idForPage,
};
