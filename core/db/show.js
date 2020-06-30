let pg = require("./pg")

module.exports = {
	all() {
		return pg.query(
			`
select
	"show"."id",
	"show"."url",
	"show"."title",
	"show"."seasonsTotal",
	"show"."currentSeason",
	json_build_object('num', "season"."num", 'episodesTotal', "season"."episodesTotal", 'episodesAired', "season"."episodesAired", 'episodeLastAt', "season"."episodeLastAt", 'episodeNextAt', "season"."episodeNextAt", 'episodeFinalAt', "season"."episodeFinalAt") as "season"
from "show"
	left join "season" on "show"."id" = "season"."showId" and "show"."currentSeason" = "season"."num";`
		)
	},
	one({ id }) {
		return pg.query(
			'select * from "show" left join "season" on "show"."id" = "season"."showId" and "show"."currentSeason" = "season"."num" where "show"."id" = $1;',
			[id]
		)
	},
	async create({ url }) {
		let title, seasonsTotal
		url = url.replace(/^.*(tt\d+).*$/i, `https://www.imdb.com/title/$1/`)
		if (!/^https:\/\/www\.imdb\.com\/title\/tt\d+\/$/i.test(url)) throw new Error("URL is not valid")

		try {
			let { browser, page } = await launchPuppeteer()
			await page.goto(url)
			title = await page.$eval(".title_wrapper > h1", h1 => h1.textContent.trim())
			seasonsTotal = await (await page.$$(".seasons-and-year-nav > div"))[2].$$eval("a", nodes => nodes.length)
			await browser.close()
		} catch (error) {
			throw error
		}

		return pg.thransactionExecute(async client => {
			let result = await client.query(
				`insert into "show" ("url", "title", "seasonsTotal", "currentSeason") values ($1, $2, $3, $3) returning *;`,
				[url, title, seasonsTotal]
			)
			let show = result.rows[0]
			result = await client.query(`insert into "season" ("showId", "num") values ($1, $2) returning *;`, [show.id, show.currentSeason])
			show.season = result.rows[0]
			return show
		})
	},
	async sync({ id }) {
		let show

		try {
			let result = await pg.query('select "id", "url", "title", "seasonsTotal", "currentSeason" from "show" where "id" = $1;', [id])
			if (!result.rowCount) throw new Error("Can't find show with id: " + id)
			show = result.rows[0]

			let { browser, page } = await launchPuppeteer()
			await page.goto(`${show.url}episodes?season=${show.currentSeason}`)
			let dates = await page.$$eval(".airdate", divs => divs.map(div => div.textContent.trim()))
			let seasonsTotal = await page.$eval("#bySeason", select => select.options[select.options.length - 1].value * 1 || 1)
			await browser.close()

			let today = new Date()
			let episodes = {
				aired: 0,
				total: dates.length,
				next: stringToDate(dates[dates.length - 1]),
				last: stringToDate(dates[0]),
				final: stringToDate(dates[dates.length - 1]),
			}
			for (let string of dates) {
				let episodeDate = stringToDate(string)
				if (episodeDate > today) {
					episodes.next = episodeDate
					break
				}
				episodes.aired++
				episodes.last = episodeDate
			}

			if (show.seasonsTotal !== seasonsTotal) await pg.query('update "show" set "seasonsTotal" = $1 where "id" = $2;', [seasonsTotal, id])

			result = await pg.query(
				`update "season" set ("episodesTotal", "episodesAired", "episodeLastAt", "episodeNextAt", "episodeFinalAt", "updatedAt") = ($3, $4, $5, $6, $7, now()) 
where "season"."showId" = $1 and "season"."num" = $2 returning *;`,
				[
					show.id,
					show.currentSeason,
					episodes.total,
					episodes.aired,
					dateToString(episodes.last),
					dateToString(episodes.next),
					dateToString(episodes.final),
				]
			)

			show.season = result.rows[0]
		} catch (error) {
			throw error
		}

		return show
	},
	update({ id, season }) {
		return pg.thransactionExecute(async client => {
			await client.query('update "show" set ("currentSeason", "updatedAt") = ($1, now()) where "id" = $2;', [season, id])
			await client.query('insert into "season" ("showId", "num", "updatedAt") values ($1, $2, now()) on conflict do nothing;', [id, season])
			return 1
		})
	},
	delete({ id }) {
		return pg.query('delete from "show" where "id" = $1;', [id])
	},
}

async function launchPuppeteer() {
	let puppeteer = require("puppeteer")
	let browser = await puppeteer.launch({
		// headless: false,
		args: ['--proxy-server="direct://"', "--proxy-bypass-list=*", "--no-sandbox", "--disable-setuid-sandbox"],
	})
	let page = await browser.newPage()
	await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en" })
	await page.setRequestInterception(true)
	page.on("request", request => {
		if (request.resourceType() !== "document") {
			request.abort()
		} else {
			request.continue()
		}
	})

	return { browser, page }
}

function stringToDate(string) {
	let month = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
	let chunks = (string || "").split(/[ .]+/).reverse()
	return new Date(chunks[0] || 2084, (month[chunks[1]] || 12) - 1, chunks[2] || 28)
}

function dateToString(date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0")
}
