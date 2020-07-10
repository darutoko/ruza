let { GraphQLNonNull, GraphQLBoolean, GraphQLString, GraphQLEnumType, GraphQLObjectType } = require("graphql")

let directoryType = new GraphQLEnumType({
	name: "Directory",
	description: "Root directory to browse",
	values: {
		downloads: { value: "/mnt/Storage/Download/!Video/" },
		films: { value: "/mnt/Storage/Video/Films/" },
	},
})

let fileType = new GraphQLObjectType({
	name: "File",
	description: "File or directory",
	fields: {
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Name of a file",
		},
		isFile: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "Is it file or some thing else",
		},
	},
})

let serviceType = new GraphQLEnumType({
	name: "Service",
	description: "Availible straming services to watch",
	values: {
		twitch: { value: "twitch" },
	},
})

let streamType = new GraphQLObjectType({
	name: "Stream",
	description: "Online video stream",
	fields: {
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Name of a stream",
		},
		game: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Name of a game",
		},
		status: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Status of a stream",
		},
	},
})

module.exports = {
	directoryType,
	fileType,
	serviceType,
	streamType,
}
