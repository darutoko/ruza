let { GraphQLNonNull, GraphQLBoolean, GraphQLString, GraphQLEnumType, GraphQLObjectType } = require("graphql");

let directoryType = new GraphQLEnumType({
	name: "Directory",
	description: "Root directory to browse",
	values: {
		downloads: { value: "D:\\Download\\!Video\\" },
		films: { value: "D:\\Video\\Films\\" },
	}
});

let fileType = new GraphQLObjectType({
	name: "File",
	description: "File or directory",
	fields: {
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Name of a file"
		},
		isFile: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "Is it file or some thing else"
		}
	}
});

module.exports = {
	directoryType,
	fileType,
}
