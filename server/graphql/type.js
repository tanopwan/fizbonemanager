'use strict';

const graphql = require('graphql');
const Batch = require('../model/batch.model');
const Product = require('../model/product.model');
const orderService = require('../service/order.service');

const AddressType = new graphql.GraphQLObjectType({
	name: 'address',
	fields: function() {
		return {
			name: { type: graphql.GraphQLString },
			street: { type: graphql.GraphQLString },
			subDistrict: { type: graphql.GraphQLString },
			district: { type: graphql.GraphQLString },
			province: { type: graphql.GraphQLString },
			postalCode: { type: graphql.GraphQLString }
		}
	}
});

const ItemType = new graphql.GraphQLObjectType({
	name: 'item',
	fields: function() {
		return {
			product: {
				type: new graphql.GraphQLObjectType({
					name: 'item_product',
					fields: function() {
						return {
							name: { type: graphql.GraphQLString },
							link: { type: graphql.GraphQLString }
						}
					}
				})
			},
			price: { type: graphql.GraphQLInt }, // satang always int
			quantity: { type: graphql.GraphQLInt },
			total: { type: graphql.GraphQLInt },
			batch: {
				type: BatchType,
				resolve: function(item) {
					return Batch.findOne({ _id: item.batchId }).exec();
				}
			}
		}
	}
});

const OrderType = new graphql.GraphQLObjectType({
	name: 'order',
	fields: function() {
		return {
			_id: { type: graphql.GraphQLID },
			customer: {
				type: new graphql.GraphQLObjectType({
					name: 'customer',
					fields: function() {
						return {
							name: { type: graphql.GraphQLString },
							refUserId: { type: graphql.GraphQLString }
						}
					}
				})
			},
			createdAt: {
				type: graphql.GraphQLString,
				resolve: function(order) {
					return order.createdAt.toISOString();;
				}
			},
			noItems: {
				type: graphql.GraphQLInt,
				resolve: function(order) {
					let no = 0;
					order.items.forEach(item => {
						no += item.quantity;
					})
					return no;
				}
			},
			total: { type: graphql.GraphQLString },
			subTotal: { type: graphql.GraphQLString },
			shippingFee: { type: graphql.GraphQLString },
			payment: {
				type: new graphql.GraphQLObjectType({
					name: 'payment',
					fields: function() {
						return {
							status: { type: graphql.GraphQLString },
							method: { type: graphql.GraphQLString },
							attachments: { type: new graphql.GraphQLList(graphql.GraphQLString) }
						}
					}
				})
			},
			shipping: {
				type: new graphql.GraphQLObjectType({
					name: 'shipping',
					fields: function() {
						return {
							status: { type: graphql.GraphQLString }
						}
					}
				})
			},
			items: {
				type: new graphql.GraphQLList(ItemType)
			},
			address: { type: AddressType }
		}
	}
});

const BatchType = new graphql.GraphQLObjectType({
	name: 'batch',
	fields: function() {
		return {
			_id: { type: graphql.GraphQLID },
			quantity: { type: graphql.GraphQLInt },
			batchRef: { type: graphql.GraphQLString },
			isInStock: { type: graphql.GraphQLBoolean },
			isFinish: { type: graphql.GraphQLBoolean },
			productId: { type: graphql.GraphQLID },
			createdBy: { type: graphql.GraphQLID },
			updatedAt: { type: graphql.GraphQLString },
			createdAt: { type: graphql.GraphQLString },
		}
	}
});

const ProductType = new graphql.GraphQLObjectType({
	name: 'product',
	fields: function() {
		return {
			_id: { type: graphql.GraphQLID },
			name: { type: graphql.GraphQLString },
			link: { type: graphql.GraphQLString },
			description: { type: graphql.GraphQLString },
			batches: { type: BatchType },
			updatedAt: { type: graphql.GraphQLString },
			createdAt: { type: graphql.GraphQLString },
		}
	}
});

const queryType = {
	products: {
		type: new graphql.GraphQLList(ProductType),
		resolve: function() {
			return Product.find().exec();
		}
	},
	product: {
		type: ProductType,
		args: {
			id: { type: graphql.GraphQLID }
		},
		resolve(_, args) {
			return Product.findOne({
				_id: args.id
			}).exec();
		}
	},
	orders: {
		type: new graphql.GraphQLList(OrderType),
		resolve: function() {
			return orderService.getOrders().then(orders => {
				return orders;
			});
		}
	}
}

module.exports = { queryType };
