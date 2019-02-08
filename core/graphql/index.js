let escape = require("pg-escape");
let JoinMonster = require("join-monster").default;
let { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString } = require("graphql");

let db = require("../db");

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
					(junctionTable, ingredientTanble, arguments) => `${junctionTable}."ingredientId" = ${ingredientTanble}.id`
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

module.exports = new GraphQLSchema(
	{
		query: new GraphQLObjectType({
			name: "Query",
			fields: {

				type: {
					type: typeType,
					args: {
						id: { type: GraphQLInt }
					},
					resolve(source, arguments, context, info) {
						return db.query("SELECT id, name FROM type WHERE id=$1;", [arguments.id]).then(res => res.rows[0]);
					}
				},

				types: {
					type: new GraphQLList(new GraphQLNonNull(typeType)),
					description: "List of all types of dishes",
					resolve(source, arguments, context, info) {
						return JoinMonster(info, {}, sql => {
							return db.query(sql, []).then(res => res.rows);
						});
					}
				},

				ingredients: {
					type: new GraphQLList(new GraphQLNonNull(ingredientType)),
					description: "List of all ingredients",
					resolve(source, arguments, context, info) {
						return JoinMonster(info, {}, sql => {
							return db.query(sql, []).then(res => res.rows);
						});
					}
				}

			}
		}),
		mutation: new GraphQLObjectType({
			name: "Mutation",
			fields: {
				bar: {
					type: new GraphQLNonNull(GraphQLString),
					resolve() {
						return "bar"
					}
				}
			}
		})
	}
);

function getJMObjectType(object) {
	let keys = ["uniqueKey", "sqlTable"];
	let newObjectType = new GraphQLObjectType(object);
	newObjectType._typeConfig = keys.reduce((accumulator, key) => { accumulator[key] = object[key]; return accumulator; }, {});
	return newObjectType;
}
