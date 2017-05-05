'use strict';

const graphqlHTTP = require('express-graphql');
const graphql = require('graphql');

const Type = require('./type');
const auth = require('../auth');

const queryType = new graphql.GraphQLObjectType({
	name: 'Query',
	fields: function() {
		return Object.assign(Type.queryType);
	}
});

const schema = new graphql.GraphQLSchema({
	query: queryType
});

module.exports = function(app) {
	app.use('/graphql', /*auth.verifyMiddleware,*/ graphqlHTTP({
		schema: schema,
		graphiql: true,
	}));
	console.log("Running a GraphQL API server ... ");
};
