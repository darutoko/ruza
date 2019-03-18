let fs = require("fs");
let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");

let { rejectedPromise } = require("./tools");
let { directoryType, fileType } = require("./videos_types");

module.exports = {
	query: {
		ls: {
			type: new GraphQLList(fileType),
			description: "Directory content",
			args: {
				directory: {
					type: new GraphQLNonNull(directoryType)
				},
				path: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve(source, {directory, path}, context, info) {
				path = path.replace(/\.\.([\/\\]+|$)/g, '').replace(/^[\/\\]+/, '');
				return fs.readdirSync(directory + path, {withFileTypes: true});
			}
		},
	},

	mutation: {
	}
}
