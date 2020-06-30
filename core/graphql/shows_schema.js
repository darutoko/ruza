let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql")

let db = require("../db")
let { checkAuthorization } = require("./tools")
let { showType, seasonType } = require("./shows_types")

module.exports = {
	query: {
		show: {
			type: new GraphQLNonNull(showType),
			description: "One Show",
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return db.show.one(arguments).then(res => {
					if (!res.rowCount) throw new Error(`Show with id "${arguments.id}" not found`)
					return res.rows[0]
				})
			},
		},

		shows: {
			type: new GraphQLList(new GraphQLNonNull(showType)),
			description: "List of all shows",
			resolve(source, arguments, context, info) {
				return db.show.all().then(res => res.rows)
			},
		},

		seasons: {
			type: new GraphQLList(new GraphQLNonNull(seasonType)),
			description: "List of all seasons of a show",
			args: {
				showId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return db.season.list(arguments).then(res => res.rows)
			},
		},
	},

	mutation: {
		addShow: {
			type: new GraphQLNonNull(showType),
			args: {
				url: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.show.create(arguments)
			},
		},

		syncShow: {
			type: new GraphQLNonNull(showType),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return db.show.sync(arguments)
			},
		},

		updateShow: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				season: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.show.update(arguments)
			},
		},

		deleteShow: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.show.delete(arguments).then(res => res.rowCount)
			},
		},
	},
}
