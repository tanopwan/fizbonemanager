'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const ProductSchema = new Schema({
	name: { type: String, unique : true, required : true },
	link: String,
	description: String,
	productCode: String,
  barcode: String,
  isActive: Boolean,
  keywords: [String],
},
{
	timestamps: true
});

let Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
