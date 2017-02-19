'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const ProductSchema = new Schema({
	name: String,
	description: String
},
{
  timestamps: true
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
