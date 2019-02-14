let escape = require("pg-escape");
let JoinMonster = require("join-monster").default;
let { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLBoolean, GraphQLInt, GraphQLString } = require("graphql");

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

let userType = new GraphQLObjectType({
	name: "User",
	description: "User of the app",
	fields: {
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: "User's name"
		},
		isAdmin: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "User's rights are admin or not"
		},
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
					orderBy: {
						name: "ASC"
					},
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

				login: {
					type: new GraphQLNonNull(userType),
					args: {
						username: {
							type: new GraphQLNonNull(GraphQLString)
						},
						password: {
							type: new GraphQLNonNull(GraphQLString)
						}
					},
					resolve(source, arguments, context, info) {
						return new Promise((resolve, reject) => {
							if (arguments.username === "admin" && arguments.password === "admin") {
								resolve({ username: "admin", isAdmin: true });
							} else {
								reject("Invalid username or password");
							}
						});
					}
				},

				addIngredient: {
					type: new GraphQLNonNull(ingredientType),
					args: {
						name: {
							type: new GraphQLNonNull(GraphQLString)
						},
					},
					resolve(source, arguments, context, info) {
						if (!context.user.isAdmin) return rejectedPromise("Access denied");
						return db.query(`INSERT INTO ingredient (name, "createdAt", "updatedAt") VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name;`, [
							arguments.name
						]).then(res => res.rows[0]);
					}
				},

				addType: {
					type: new GraphQLNonNull(typeType),
					args: {
						name: {
							type: new GraphQLNonNull(GraphQLString)
						},
					},
					resolve(source, arguments, context, info) {
						if (!context.user.isAdmin) return rejectedPromise("Access denied");
						return db.query(`INSERT INTO type (name, "createdAt", "updatedAt") VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name;`, [
							arguments.name
						]).then(res => res.rows[0]);
					}
				},

				updateIngredient: {
					type: new GraphQLNonNull(ingredientType),
					args: {
						id: {
							type: new GraphQLNonNull(GraphQLInt)
						},
						name: {
							type: new GraphQLNonNull(GraphQLString)
						},
					},
					resolve(source, arguments, context, info) {
						if (!context.user.isAdmin) return rejectedPromise("Access denied");
						return db.query(`UPDATE ingredient SET (name, "updatedAt") = ($1, CURRENT_TIMESTAMP) WHERE id = $2 RETURNING id, name;`, [
							arguments.name,
							arguments.id
						]).then(res => res.rows[0]);
					}
				},

				updateType: {
					type: new GraphQLNonNull(typeType),
					args: {
						id: {
							type: new GraphQLNonNull(GraphQLInt)
						},
						name: {
							type: new GraphQLNonNull(GraphQLString)
						},
					},
					resolve(source, arguments, context, info) {
						if (!context.user.isAdmin) return rejectedPromise("Access denied");
						return db.query(`UPDATE type SET (name, "updatedAt") = ($1, CURRENT_TIMESTAMP) WHERE id = $2 RETURNING id, name;`, [
							arguments.name,
							arguments.id
						]).then(res => res.rows[0]);
					}
				},

				deleteIngredient: {
					type: new GraphQLNonNull(GraphQLInt),
					args: {
						id: {
							type: new GraphQLNonNull(GraphQLInt)
						},
					},
					resolve(source, arguments, context, info) {
						if (!context.user.isAdmin) return rejectedPromise("Access denied");
						return db.query(`SELECT count(*) FROM "dishIngredient" WHERE "ingredientId" = $1;`, [arguments.id])
							.then(select => {
								if (select.rows[0].count > 0) return rejectedPromise("Невозможно удалить ингредиент, пока он используется в блюдах.");

								return db.query(`DELETE FROM ingredient WHERE id = $1;`, [arguments.id])
									.then(res => res.rowCount);
							});
					}
				},

				deleteType: {
					type: new GraphQLNonNull(GraphQLInt),
					args: {
						id: {
							type: new GraphQLNonNull(GraphQLInt)
						},
					},
					resolve(source, arguments, context, info) {
						if (!context.user.isAdmin) return rejectedPromise("Access denied");
						return db.query(`SELECT count(*) FROM "dish" WHERE "typeId" = $1;`, [arguments.id])
							.then(select => {
								if (select.rows[0].count > 0) return rejectedPromise("Невозможно удалить ингредиент, пока он используется в блюдах.");

								return db.query(`DELETE FROM type WHERE id = $1;`, [arguments.id])
									.then(res => res.rowCount);
							});
					}
				},

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

function rejectedPromise(reason) { return Promise.reject(new Error(reason)) }
