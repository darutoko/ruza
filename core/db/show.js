let pg = require("./pg")

module.exports = {
	all() {
		return pg.query(
			'select * from "show" left join "season" on "show"."id" = "season"."showId" and "show"."currentSeason" = "season"."num";'
		)
	},
	one({ id }) {
		return pg.query(
			'select * from "show" left join "season" on "show"."id" = "season"."showId" and "show"."currentSeason" = "season"."num" where "show"."id" = $1;',
			[id]
		)
	},
	async create({ url }) {
		let show
		url = url.replace(/^.*(tt\d+).*$/i, `https://www.imdb.com/title/$1/`)
		if (!/^https:\/\/www\.imdb\.com\/title\/tt\d+\/$/i.test(url)) throw new Error("URL is not valid")

		try {
			let { browser, page } = await launchPuppeteer()
			await page.goto(url)
			let title = await page.$eval(".title_wrapper > h1", h1 => h1.textContent.trim())
			let seasons = await (await page.$$(".seasons-and-year-nav > div"))[2].$$eval("a", nodes => nodes.length)
			await browser.close()

			let result = await pg.query(
				`insert into "show" ("url", "title", "seasons", "currentSeason", "search", "uploaded", "createdAt", "updatedAt")
values ($1, $2, $3, $4, $2, $5, now(), now()) returning *;`,
				[url, title, seasons, seasons, "ettv"]
			)

			show = result.rows[0]
		} catch (error) {
			throw error
		}

		return show
	},
	async sync({ id }) {
		let show

		try {
			let result = await pg.query('select "id", "url", "title", "seasons", "currentSeason" from "show" where "id" = $1;', [id])
			if (!result.rowsCount) throw new Error("Can't find show with id: " + id)
			show = result.rows[0]

			let { browser, page } = await launchPuppeteer()
			await page.goto(`${show.url}episodes?season=${show.currentSeason}`)
			let dates = await page.$$eval(".airdate", divs => divs.map(div => div.textContent.trim()))
			let seasons = await page.$eval("#bySeason", select => select.options[select.options.length - 1].value * 1 || 1)
			await browser.close()

			let today = new Date()
			let directory = "D:\\Download\\!Video\\" + show.title + " S" + show.currentSeason.toString().padStart(2, "0")
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

			if (show.seasons !== seasons) await pg.query('update "show" set "seasons" = $1 where "id" = $2;', [seasons, id])

			result = await pg.query(
				`insert into "season" ("showId", "num", "episodesTotal", "episodesAired", "episodeLastAt", "episodeNextAt", "episodeFinalAt", "directory", "createdAt", "updatedAt")
values ($1, $2, $3, $4, $5, $6, $7, $8, now(), now()) on conflict on constraint season_pkey do update
set ("episodesTotal", "episodesAired", "episodeLastAt", "episodeNextAt", "episodeFinalAt", "updatedAt") = ($3, $4, $5, $6, $7, now()) where "season"."show_id" = $1 and "season"."num" = $2
returning *;`,
				[show.id, show.currentSeason, episodes.total, episodes.aired, episodes.last, episodes.next, episodes.final, directory]
			)

			show.season = result.rows[0]
		} catch (error) {
			throw error
		}

		return show
	},
	async update({ id, currentSeason, serch, uploaded, directory }) {
		await pg.query('update "show" set ("currentSeason", "search", "uploaded") = ($1, $2, $3) where "id" = $4;', [
			currentSeason,
			serch,
			uploaded,
			id,
		])
		await pg.query('update public."season" set "directory" = $1 where "showId" = $2 and "num" = $3;', [directory, id, current_season])
		return 1
	},
	delete({ id }) {
		return pg.query('delete from "show" where "id" = $1 returning *;', [id])
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
