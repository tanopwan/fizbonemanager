'use strict';

const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');

const Product = require('./product');
const auth = require('../auth');

const queryType = new graphql.GraphQLObjectType({
	name: 'Query',
	fields: function() {
		return Object.assign(Product.queryType);
	}
});

const mutationType = new graphql.GraphQLObjectType({
	name: 'Mutation',
	fields: () => {
		return Object.assign(Product.mutationType);
	}
});

const schema = new graphql.GraphQLSchema({
	query: queryType,
	mutation: mutationType,
});

module.exports = function(app) {
	app.use('/graphql', auth.verifyMiddleware, graphqlHTTP({
		schema: schema,
		graphiql: true,
	}));
	console.log("Running a GraphQL API server ... ");
};
