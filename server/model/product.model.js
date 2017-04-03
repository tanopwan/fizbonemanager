'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const ProductSchema = new Schema({
	name: { type: String, unique : true, required : true },
	description: String,
},
{
	timestamps: true
});

let Product = null;
try {
	Product = mongoose.model('Product');
}
catch (error) {
	Product = mongoose.model('Product', ProductSchema);
}

module.exports = Product;
