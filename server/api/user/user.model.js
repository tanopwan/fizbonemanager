'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const authTypes = ['facebook'];

const UserSchema = new Schema({
	name: String,
	provider: String,
	role: {
		type: String,
		default: 'user'
	},
	email: String,
	facebook: {}
},
{
  timestamps: true
});

UserSchema.methods = {
	authenticate(password) {
		return this.password === this.encryptPassword(password);
	},
	isAdmin() {
		return this.role === 'admin';
	}
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
