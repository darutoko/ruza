let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql")

let db = require("../db")
let { checkAuthorization } = require("./tools")
let { typeType, ingredientType, dishType } = require("./food_types")

module.exports = {
	query: {
		dish: {
			type: new GraphQLNonNull(dishType),
			description: "One Dish",
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return db.dish.one({ id: arguments.id }).then(res => {
					if (!res.rowCount) throw new Error(`Dish with id "${arguments.id}" not found`)
					return res.rows[0]
				})
			},
		},

		types: {
			type: new GraphQLList(new GraphQLNonNull(typeType)),
			description: "List of all types of dishes",
			resolve(source, arguments, context, info) {
				return db.type.all().then(res => res.rows)
			},
		},

		ingredients: {
			type: new GraphQLList(new GraphQLNonNull(ingredientType)),
			description: "List of all ingredients",
			resolve(source, arguments, context, info) {
				return db.ingredient.all().then(res => res.rows)
			},
		},
	},

	mutation: {
		addIngredient: {
			type: new GraphQLNonNull(ingredientType),
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.ingredient.create(arguments).then(res => res.rows[0])
			},
		},

		addDish: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
				typeId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				recipe: {
					type: GraphQLString,
				},
				ingredients: {
					type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.dish.create(arguments)
			},
		},

		addType: {
			type: new GraphQLNonNull(typeType),
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.type.create(arguments).then(res => res.rows[0])
			},
		},

		updateIngredient: {
			type: new GraphQLNonNull(ingredientType),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.ingredient.update(arguments).then(res => res.rows[0])
			},
		},

		updateDish: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
				typeId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				recipe: {
					type: GraphQLString,
				},
				ingredients: {
					type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.dish.update(arguments)
			},
		},

		updateType: {
			type: new GraphQLNonNull(typeType),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.type.update(arguments).then(res => res.rows[0])
			},
		},

		deleteIngredient: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.ingredient.delete(arguments).then(res => res.rowCount)
			},
		},

		deleteDish: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.dish.delete(arguments).then(res => res.rowCount)
			},
		},

		deleteType: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.type.delete(arguments).then(res => res.rowCount)
			},
		},
	},
}
