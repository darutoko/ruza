let { GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString } = require("graphql");
let { getJMObjectType } = require("./tools");

let ingredientType = getJMObjectType({
	name: "Ingredient",
	uniqueKey: "id",
	sqlTable: "ingredient",
	description: "Ingredient is what dish consists of",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Ingredient's unique id"
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Ingredient's name"
		},
	}
});

let dishType = getJMObjectType({
	name: "Dish",
	uniqueKey: "id",
	sqlTable: "dish",
	description: "Dish is what can be cooked",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Dish's unique id"
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Dish's name"
		},
		recipe: {
			type: GraphQLString,
			description: "Dish's recipe"
		},
		ingredients: {
			type: new GraphQLList(new GraphQLNonNull(ingredientType)),
			description: "Dish's ingredients",
			junction: {
				sqlTable: `"dishIngredient"`,
				sqlJoins: [
					(dishTable, junctionTable, arguments) => `${dishTable}.id = ${junctionTable}."dishId"`,
					(junctionTable, ingredientTable, arguments) => `${junctionTable}."ingredientId" = ${ingredientTable}.id`
				]
			}
		}
	}
});

let typeType = getJMObjectType({
	name: "Type",
	uniqueKey: "id",
	sqlTable: "type",
	description: "Type is what kind of dish it is",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Type's unique id"
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Type's name"
		},
		dishes: {
			type: new GraphQLList(new GraphQLNonNull(dishType)),
			description: "List of dishes of this type",
			sqlJoin: (typeTable, dishTable, arguments) => `${typeTable}.id = ${dishTable}."typeId"`
		}
	}
});

module.exports = {
	typeType,
	ingredientType,
	dishType
};
