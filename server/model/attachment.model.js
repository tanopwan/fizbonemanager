'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const AttachmentSchema = new Schema({
	customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, strict: false });

const Attachment = mongoose.model('Attachment', AttachmentSchema);

module.exports = Attachment;
