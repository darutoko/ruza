let pg = require("./pg")

module.exports = {
	all() {
		return pg.query(
			`
select
	"ingredient"."id",
	"ingredient"."name"
from "ingredient"
order by "ingredient"."name" ASC;
			`
		)
	},
	create({ name }) {
		return pg.query('insert into "ingredient" ("name", "createdAt", "updatedAt") values ($1, now(), now()) returning "id", "name";', [name])
	},
	update({ id, name }) {
		return pg.query('update "ingredient" set ("name", "updatedAt") = ($1, now()) where "id" = $2 returning "id", "name";', [name, id])
	},
	async delete({ id }) {
		let result = await pg.query('select count(*) from "dishIngredient" where "ingredientId" = $1;', [id])
		if (result.rows[0].count > 0) throw new Error("Невозможно удалить ингредиент, пока он используется в блюдах.")
		return db.query('delete from "ingredient" where "id" = $1;', [id])
	},
}
