let { GraphQLNonNull, GraphQLBoolean, GraphQLString, GraphQLEnumType, GraphQLObjectType } = require("graphql");

let directoryType = new GraphQLEnumType({
	name: "Directory",
	description: "Root directory to browse",
	values: {
		downloads: { value: "D:\\Download\\!Video\\" },
		films: { value: "D:\\Video\\Films\\" },
		twitch: { value: "https://api.twitch.tv/kraken/streams/followed" },
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
		description: {
			type: GraphQLString,
			description: "Additional data about file"
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
