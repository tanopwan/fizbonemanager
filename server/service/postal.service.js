'use strict';

var postals = require('../config/area-th.json');
console.log(`Read ${postals.length} PostalCodes`);

module.exports = {
	getPostal(code) {
		if (postals) {
			return postals.find(postal => postal.postCode === code);
		}
	}
}
