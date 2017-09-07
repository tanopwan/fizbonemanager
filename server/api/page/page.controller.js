'use strict';

const PageService = require('../../service/page.service');

const conversations = function (req, res) {
	return PageService.getConversations(req, res);
}

const attachments = function (req, res) {
	
	return PageService.getAttachments(req.user, req.params.id).then(response => {
		res.json(response);
	}).catch(error => {
		console.log(error);
		res.status(500).json(error)
	})
	
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
	attachments,
	idForPage,
};
