let pg = require("./pg")

module.exports = {
	one({ id }) {
		return pg.query(
			`
select
	"dish"."id",
	"dish"."name",
	"dish"."typeId",
	"dish"."recipe",
	json_agg(json_build_object('id', "ingredient"."id", 'name', "ingredient"."name")) as "ingredients"
from "dish"
	join "dishIngredient" on "dish"."id" = "dishIngredient"."dishId"
	join "ingredient" on "ingredient"."id" = "dishIngredient"."ingredientId"
where "dish"."id" = $1
group by "dish"."id";
			`,
			[id]
		)
	},
	async create({ name, typeId, recipe, ingredients }) {
		return pg.thransactionExecute(async client => {
			let sql =
				'insert into "dish" ("name", "typeId", "recipe", "createdAt", "updatedAt") values ($1, $2, $3, now(), now()) returning "id";'
			let dish = await client.query(sql, [name, typeId, recipe])
			dish = dish.rows[0]

			sql =
				'insert into "dishIngredient" ("dishId", "ingredientId", "createdAt", "updatedAt") values ' +
				ingredients.map((value, i) => `(${dish.id}, $${i + 1}, now(), now())`).join() +
				";"
			await client.query(sql, ingredients)

			return dish.id
		})
	},
	async update({ id, name, typeId, recipe, ingredients }) {
		return pg.thransactionExecute(async client => {
			let sql =
				'insert into "dishIngredient" ("dishId", "ingredientId", "createdAt", "updatedAt") values' +
				ingredients.map((_, i) => `(\$${i * 2 + 1}, \$${(i + 1) * 2}, now(), now())`).join() +
				"on conflict do nothing;"
			await client.query(sql, [].concat(...ingredients.map(v => [id, v]))) // map produces [id, ingredient] arrays, and concat flattens them

			sql =
				'delete from "dishIngredient" where "dishId" = $1 and "ingredientId" not in (' +
				ingredients.map((_, i) => `\$${i + 2}`).join() +
				");"
			await client.query(sql, [id, ...ingredients])

			sql = 'update "dish" set ("name", "typeId", "recipe", "updatedAt") = ($1, $2, $3, now()) where "id" = $4;'
			let result = await client.query(sql, [name, typeId, recipe, id])

			return result.rowCount
		})
	},
	delete({ id }) {
		return pg.query('delete from "dish" where "id" = $1;', [id])
	},
}
