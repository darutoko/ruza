let { GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString } = require("graphql")

let ingredientType = new GraphQLObjectType({
	name: "Ingredient",
	description: "Ingredient is what dish consists of",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Ingredient's unique id",
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Ingredient's name",
		},
	},
})

let dishType = new GraphQLObjectType({
	name: "Dish",
	description: "Dish is what can be cooked",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Dish's unique id",
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Dish's name",
		},
		typeId: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Dish's type id",
		},
		recipe: {
			type: GraphQLString,
			description: "Dish's recipe",
		},
		ingredients: {
			type: new GraphQLList(new GraphQLNonNull(ingredientType)),
			description: "Dish's ingredients",
		},
	},
})

let typeType = new GraphQLObjectType({
	name: "Type",
	description: "Type is what kind of dish it is",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Type's unique id",
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Type's name",
		},
		dishes: {
			type: new GraphQLList(new GraphQLNonNull(dishType)),
			description: "List of dishes of this type",
		},
	},
})

module.exports = {
	typeType,
	ingredientType,
	dishType,
}
