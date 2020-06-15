let { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLBoolean, GraphQLString } = require("graphql")

let foodSchema = require("./food_schema")
let showsSchema = require("./shows_schema")
// let videosSchema = require("./videos_schema");

let userType = new GraphQLObjectType({
	name: "User",
	description: "User of the app",
	fields: {
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: "User's name",
		},
		isAdmin: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "User's rights are admin or not",
		},
	},
})

module.exports = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: "Query",
		fields: {
			...foodSchema.query,
			...showsSchema.query,
			// ...videosSchema.query,
		},
	}),
	mutation: new GraphQLObjectType({
		name: "Mutation",
		fields: {
			...foodSchema.mutation,
			...showsSchema.mutation,
			// ...videosSchema.mutation,

			login: {
				type: new GraphQLNonNull(userType),
				args: {
					username: {
						type: new GraphQLNonNull(GraphQLString),
					},
					password: {
						type: new GraphQLNonNull(GraphQLString),
					},
				},
				resolve(source, arguments, context, info) {
					return new Promise((resolve, reject) => {
						if (arguments.username === "admin" && arguments.password === "admin") {
							resolve({ username: "admin", isAdmin: true })
						} else {
							reject("Invalid username or password")
						}
					})
				},
			},
		},
	}),
})
