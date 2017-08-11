'use strict';

const PageService = require('../../service/page.service');

const conversations = function (req, res) {
	return PageService.getConversations(req, res);
}


module.exports = {
	conversations,
};
