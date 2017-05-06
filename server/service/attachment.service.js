'use strict';

const Attachment = require('../model/attachment.model');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const saveAttachment = (customerId, attachment) => {
	return Attachment.create({ customerId: new ObjectId(customerId), attachment });
}

module.exports = {
	saveAttachment
}
