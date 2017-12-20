'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const ExpenseSchema = new Schema({
	amount: Number,
  month: Number,
  year: Number,
  date: Date,
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
	timestamps: true
});

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;
