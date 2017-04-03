'use strict';

const graphql = require('graphql');
const Product = require('../../model/product.model');

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
			description: { type: graphql.GraphQLString },
			batches: { type: BatchType },
			updatedAt: { type: graphql.GraphQLString },
			createdAt: { type: graphql.GraphQLString },
		}
	}
});

const ProductTypeResponse = new graphql.GraphQLObjectType({
	name: 'productResponse',
	fields: function() {
		return {
			product: { type: ProductType }
		}
	}
});

const DeleteTypeResponse = new graphql.GraphQLObjectType({
	name: 'DeleteTypeResponse',
	fields: function() {
		return {
			ok: { type: graphql.GraphQLInt },
			n: { type: graphql.GraphQLInt }
		}
	}
})

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
	}
}

const mutationType = {
	addProduct: {
		type: ProductTypeResponse,
		description: 'Add a product',
		args: {
			name: { type: graphql.GraphQLString },
			description: { type: graphql.GraphQLString }
		},
		resolve: (value, product, context, rootValue) => {
			if (context.user) {
				return Product.create(product).then(result => {
					return { product: result };
				}).catch(result => {
					console.log(result);
					return result;
				});
			}
			return null;
		}
	},
	deleteProduct: {
		type: DeleteTypeResponse,
		description: 'Hard delete a product from _id',
		args: {
			_id: { type: graphql.GraphQLID }
		},
		resolve(value, _id) {
			return Product.findOne({ _id }).remove().exec().then(result => {
				return result.result;
			}).catch(result => {
				return result.result;
			});
			/*return Batch.findOne({ productId }).exec()
			.then(product => {
				if(product) {
					return { error: result };
				}
				return Product.findOne({ _id: productId }).remove().exec();
			})
			.then(result => {
				res.json(result);
			})
			.catch(err => res.status(500).json(err));*/
		}
	}
}
module.exports = { ProductType, queryType, mutationType };
