let { GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString } = require("graphql");
let { getJMObjectType } = require("./tools");

let showType = getJMObjectType({
	name: "Show",
	uniqueKey: "id",
	sqlTable: "show",
	description: "Show is what ypu watch on TV",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's unique id"
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Show's name"
		},
	}
});

module.exports = {
	showType
}
