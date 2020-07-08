let pg = require("./pg")

module.exports = {
	all() {
		return pg.query(
			`
select
	"type"."id",
	"type"."name",
	json_agg(json_build_object('id', "d"."id", 'name', "d"."name", 'recipe', "d"."recipe", 'ingredients', "d"."ingredients")) as "dishes"
from "type"
join (
	select
		"dish"."id",
		"dish"."name",
		"dish"."typeId",
		"dish"."recipe",
		json_agg(json_build_object('id', "ingredient"."id", 'name', "ingredient"."name")) as "ingredients"
	from "dish"
		join "dishIngredient" on "dish"."id" = "dishIngredient"."dishId"
		join "ingredient" on "ingredient"."id" = "dishIngredient"."ingredientId"
	group by "dish"."id"
) as "d" on "type"."id" = "d"."typeId"
group by "type"."id";
			`
		)
	},
	create({ name }) {
		return pg.query('insert into "type" ("name", "createdAt", "updatedAt") values ($1, now(), now()) returning "id", "name";', [name])
	},
	update({ id, name }) {
		return pg.query('update "type" set ("name", "updatedAt") = ($1, now()) where id = $2 returning "id", "name";', [name, id])
	},
	async delete({ id }) {
		let res = await pg.query('select count(*) from "dish" where "typeId" = $1;', [id])
		if (res.rows[0].count > 0) throw new Error("Невозможно удалить вид, пока он содержит блюда.")
		return pg.query('delete from "type" where "id" = $1;', [id])
	},
}
