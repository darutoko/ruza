let escape = require("pg-escape");
let JoinMonster = require("join-monster").default;
let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");

let db = require("../db");
let { rejectedPromise } = require("./tools");
let { typeType, ingredientType, dishType } = require("./food_types");

module.exports = {
	query: {
		dish: {
			type: new GraphQLNonNull(dishType),
			description: "One Dish",
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			where: (dishTable, arguments, context) => {
				return escape(`${dishTable}.id = %s`, arguments.id);
			},
			resolve(source, arguments, context, info) {
				return JoinMonster(info, {}, sql => {
					return db.query(sql, []).then(res => res.rows);
				});
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

		addDish: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString)
				},
				typeId: {
					type: new GraphQLNonNull(GraphQLInt)
				},
				recipe: {
					type: GraphQLString
				},
				ingredients: {
					type: new GraphQLList(new GraphQLNonNull(GraphQLInt))
				}
			},
			async resolve(source, arguments, context, info) {
				if (!context.user.isAdmin) return rejectedPromise("Access denied");

				let sql = "";
				let dish = {};
				let client = await db.client();

				try {
					await client.query("BEGIN;");

					sql = `INSERT INTO dish (name, "typeId", recipe, "createdAt", "updatedAt") VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name, "typeId", recipe;`;
					let result = await client.query(sql, [arguments.name, arguments.typeId, arguments.recipe]);
					dish = result.rows[0];

					sql = `INSERT INTO "dishIngredient" ("dishId", "ingredientId", "createdAt", "updatedAt") VALUES ` +
						arguments.ingredients.map((value, i) => `(${dish.id}, $${i + 1}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`).join() + ";";
					await client.query(sql, arguments.ingredients);

					await client.query("COMMIT;");
				} catch (error) {
					await client.query("ROLLBACK;");
					throw error;
				} finally {
					client.release();
				}

				return dish.id;
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

		updateDish: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				},
				name: {
					type: new GraphQLNonNull(GraphQLString)
				},
				typeId: {
					type: new GraphQLNonNull(GraphQLInt)
				},
				recipe: {
					type: GraphQLString
				},
				ingredients: {
					type: new GraphQLList(new GraphQLNonNull(GraphQLInt))
				}
			},
			async resolve(source, arguments, context, info) {
				if (!context.user.isAdmin) return rejectedPromise("Access denied");

				let sql = "";
				let updated = 0;
				let ingredients = {};
				let client = await db.client();

				try {
					await client.query("BEGIN;");

					sql = `SELECT "ingredientId" AS id FROM "dishIngredient" WHERE "dishId" = $1;`;
					let result = await client.query(sql, [arguments.id]);

					ingredients.current = result.rows.map(row => row.id);
					ingredients.add = arguments.ingredients.filter(ingredient => ingredients.current.indexOf(ingredient) < 0);
					ingredients.remove = ingredients.current.filter(ingredient => arguments.ingredients.indexOf(ingredient) < 0);

					if (ingredients.add.length) {
						sql = `INSERT INTO "dishIngredient" ("dishId", "ingredientId", "createdAt", "updatedAt") VALUES ` +
							ingredients.add.map((value, i) => `(${escape.string(arguments.id)}, $${i + 1}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`).join() + ";";
						await client.query(sql, ingredients.add);
					}
					if (ingredients.remove.length) {
						sql = `DELETE FROM "dishIngredient" WHERE "dishId" = $1 AND "ingredientId" IN (` +
							ingredients.remove.map((value, i) => `$${i + 2}`).join() + ");"
						await client.query(sql, [arguments.id, ...ingredients.remove]);
					}

					sql = `UPDATE dish SET (name, "typeId", recipe, "updatedAt") = ($1, $2, $3, CURRENT_TIMESTAMP) WHERE id = $4 RETURNING id;`;
					result = await client.query(sql, [arguments.name, arguments.typeId, arguments.recipe, arguments.id]);

					await client.query("COMMIT;");

					updated = result.rowCount;
				} catch (error) {
					await client.query("ROLLBACK;");
					throw error;
				} finally {
					client.release();
				}

				return updated;
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

		deleteDish: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				},
			},
			resolve(source, arguments, context, info) {
				if (!context.user.isAdmin) return rejectedPromise("Access denied");
				return db.query(`DELETE FROM dish WHERE id = $1;`, [arguments.id])
					.then(res => res.rowCount);
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
