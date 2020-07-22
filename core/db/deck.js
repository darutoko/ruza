let pg = require("./pg")
var https = require("https")

module.exports = {
	all() {
		return pg.query(
			'select "deck".*, count("card"."id") as "totalCards", count("card"."id") filter (where "card"."streak" >= "deck"."streakSize") as "completedCards",\
		count("card"."id") filter (where "card"."streak" = 0) as "failedCards" from "deck" left join "card" on "deck"."id" = "card"."deckId" group by "deck"."id";'
		)
	},
	one({ id }) {
		return pg.query('select * from "deck" where id = $1;', [id])
	},
	create({ name }) {
		return pg.query('insert into "deck" ("name") values ($1);', [name])
	},
	update({ id, ...fields }) {
		let keys = Object.keys(fields)
		let updates = keys.map((key, i) => `"${key}" = \$${i + 1}`).join(", ")
		return pg.query('update "deck" set ' + updates + ', "updatedAt" = default where "id" = $' + (keys.length + 1) + " returning *;", [
			...keys.map(key => fields[key]),
			id,
		])
	},
	delete({ id }) {
		return pg.query('delete from "deck" where "id" = $1', [id])
	},
	async getYandexDictionary(arguments) {
		let data = await lookupYandexDictionary(arguments)
		if (!data.def.length) throw new Error(`Word "${arguments.text}" was not found for language ${arguments.lang}`)

		let result = []
		for (let def of data.def) {
			let d = {
				text: def.text,
				pos: def.pos,
				ts: def.ts,
				tr: [],
			}
			// Prepend nouns with masculine/feminine indefinite articles
			if (def.pos === "noun")
				if (def.gen === "f") d.text = "une " + d.text
				else d.text = "un " + d.text

			for (let tr of def.tr) {
				if (!tr.syn) tr.syn = []
				// Unite each translation and up to 3 of it synonyms in to separate string
				d.tr.push([tr.text, ...tr.syn.slice(0, 3).map(s => s.text)].join(", "))
			}

			result.push(d)
		}

		return result
	},
}

var lookupYandexDictionary = params =>
	new Promise((resolve, reject) => {
		params.key = process.env.YADI_KEY
		var url =
			"https://dictionary.yandex.net/api/v1/dicservice.json/lookup?" +
			encodeURI(
				Object.keys(params)
					.map(key => key + "=" + params[key])
					.join("&")
			)
		https
			.get(url, response => {
				var data = ""
				response.on("data", chunk => (data += chunk))
				response.on("end", () => {
					try {
						data = JSON.parse(data)
					} catch (error) {
						reject(error)
					}
					resolve(data)
				})
			})
			.on("error", reject)
	})

/*
Total: all cards in the deck.
Completed: cards that have "streak" value equal or more than deck's "streakSize" value.
Incomplete: cards that have "streak" value less than deck's "streakSize" value.
Progressed: cards that have "streak" value less than deck's "streakSize" value and greater than 0.
Failed: cards that have "streak" value equal to 0.

Total = Completed + Incomplete = Completed + Progressed + Failed
*/
