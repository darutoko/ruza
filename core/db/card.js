var pg = require("./pg")

pg.query(
	`
update "card" set "streak" = "streak" - "degradationStep", "updatedAt" = now()
from "deck"
where
	"deck"."isStrakDegrades"
	and "card"."deckId" = "deck"."id"
	and now() - "card"."updatedAt" > ("deck"."degradationInterval"::text || ' days')::interval
	and "card"."streak" > "deck"."degradationStep";`
)
	.then(() => {})
	.catch(() => {})

module.exports = {
	byDeck({ deckId }) {
		return pg.query('select * from "card" where "deckId" = $1;', [deckId])
	},
	subset({ deckId, limit, subset }) {
		var where = "" // Default subset: all
		if (subset === "failed") where = 'and "streak" = 0'
		else if (subset === "incomplete") where = 'and "streak" < "deck"."streakSize"'
		return pg.query(
			`
select * from (
	select "card".* from "card" join "deck" on "card"."deckId" = "deck"."id"
	where "deckId" = $1 ${where}
	order by "card"."updatedAt" limit $2
	) as oldest 
order by random();`,
			[deckId, limit]
		)
	},
	create({ input, front, back, testByFront, deckId }) {
		return pg.query('insert into "card" ("input", "front", "back", "testByFront", "deckId") values ($1, $2, $3, $4, $5);', [
			input,
			front,
			back,
			testByFront,
			deckId,
		])
	},
	updateDeck({ ids, newDeckId }) {
		return pg.query('update "card" set "deckId" = $1 where "id" = any ($2)', [newDeckId, ids])
	},
	updateStreak({ id, isTestPassed }) {
		let value
		if (isTestPassed) value = '"streak"+1'
		else value = 0
		return pg.query('update "card" set "streak" = ' + value + ', "updatedAt" = default where "id" = $1', [id])
	},
	delete({ ids }) {
		return pg.query('delete from "card" where "id" = any ($1)', [ids])
	},
}
