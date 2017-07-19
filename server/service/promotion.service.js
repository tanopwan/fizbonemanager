'use strict';

const Promotion = require('../model/promotion.model');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getPromotions = (productId) => {
    let isEnded = { $in: [null, false] };

    return Promotion.find({ isEnded: isEnded }).exec();
}

module.exports = {
	getPromotions,
}
