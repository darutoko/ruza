let escape = require("pg-escape");
let JoinMonster = require("join-monster").default;
let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");

let db = require("../db");
let { rejectedPromise } = require("./tools");
let { typeType, ingredientType, dishType } = require("./food_types");

module.exports = {
	query: {
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
	},

	mutation: {
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
						if (select.rows[0].count > 0) return rejectedPromise("Невозможно удалить вид, пока он содержит блюда.");

						return db.query(`DELETE FROM type WHERE id = $1;`, [arguments.id])
							.then(res => res.rowCount);
					});
			}
		},
	}
}
