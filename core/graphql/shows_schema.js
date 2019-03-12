let escape = require("pg-escape");
let puppeteer = require("puppeteer");
let JoinMonster = require("join-monster").default;
let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");

let db = require("../db");
let { rejectedPromise } = require("./tools");
let { showType } = require("./shows_types");

module.exports = {
	query: {
		shows: {
			type: new GraphQLList(new GraphQLNonNull(showType)),
			description: "List of all shows",
			resolve(source, arguments, context, info) {
				return JoinMonster(info, {}, sql => {
					return db.query(sql, []).then(res => res.rows);
				}, {dialect:'pg'});
			}
		},

	},

	mutation: {
		addShow: {
			type: new GraphQLNonNull(showType),
			args: {
				url: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			async resolve(source, arguments, context, info) {
				if (!context.user.isAdmin) return rejectedPromise("Access denied");

				let show;
				let url = arguments.url.replace(/^.*(tt\d+).*$/i, `https://www.imdb.com/title/$1/`);
				if (!/^https:\/\/www\.imdb\.com\/title\/tt\d+\/$/i.test(url)) return rejectedPromise("URL is not valid");

				try {
					let {browser, page} = await launchPuppeteer();
					await page.goto(url);
					let title = await page.$eval(".title_wrapper > h1", h1 => h1.textContent.trim());
					let seasons = await (await page.$$(".seasons-and-year-nav > div"))[2].$$eval("a", nodes => nodes.length);
					await browser.close();

					let result = await db.query(
						`INSERT INTO public.show (url, title, seasons, current_season, search, uploaded, "createdAt", "updatedAt")
VALUES ($1, $2, $3, $4, $2, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *;`,
						[ url, title, seasons, seasons, "ettv" ]);

					show = result.rows[0];
				} catch (error) {
					console.log(error);
					throw error;
				}

				return show;
			}
		},

		syncShow: {
			type: new GraphQLNonNull(showType),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			async resolve(source, arguments, context, info) {
				let show;

				try {
					let result = await db.query(`SELECT id, url, title, seasons, current_season FROM public.show WHERE id = $1;`, [ arguments.id ]);
					show = result.rows[0];
					if (show.id != arguments.id) return rejectedPromise("Can't find show with id: " + arguments.id);

					// let {browser, page} = await launchPuppeteer();
					// await page.goto(`${show.url}episodes?season=${show.current_season}`);
					// let dates = await page.$$eval(".airdate", divs => divs.map(div => div.textContent.trim()));
					// console.log("dates: " + dates);
					// await browser.close();
					let dates = ["28 Jan. 2019", "2 Feb. 2019"];
					// let dates = ["16 Oct. 2018", "23 Oct. 2018", "30 Oct. 2018", "13 Nov. 2018", "20 Nov. 2018", "27 Nov. 2018", "4 Dec. 2018", "11 Dec. 2018", "8 Jan. 2019", "15 Jan. 2019", "22 Jan. 2019", "12 Feb. 2019", "19 Feb. 2019", "26 Feb. 2019", "5 Mar. 2019", "19 Mar. 2019", "26 Mar. 2019", "", "", ""];
					let today = new Date;
					let directory = "D:\\Download\\!Video\\" + show.title + " S" + show.current_season.toString().padStart(2, '0');
					let episodes = {
						aired: 0,
						total: dates.length,
						next: stringToDate(dates[dates.length-1]),
						last: stringToDate(dates[0]),
						final: stringToDate(dates[dates.length-1]),
					};
					for (let string of dates) {
						let episodeDate = stringToDate(string);
						if (episodeDate > today) {
							episodes.next = episodeDate;
							break;
						}
						episodes.aired++;
						episodes.last = episodeDate;
					}

					result = await db.query(
						`INSERT INTO public.season (show_id, num, episodes_total, episodes_aired, episode_last_at, episode_next_at, episode_final_at, directory, "createdAt", "updatedAt")
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT ON CONSTRAINT season_pkey DO UPDATE
SET (episodes_total, episodes_aired, episode_last_at, episode_next_at, episode_final_at, "updatedAt") = ($3, $4, $5, $6, $7, CURRENT_TIMESTAMP) WHERE season.show_id = $1 AND season.num = $2
RETURNING *;`,
						[ show.id, show.current_season, episodes.total, episodes.aired, episodes.last, episodes.next, episodes.final, directory ]);

					show.season = result.rows[0];
				} catch (error) {
					console.log(error);
					throw error;
				}

				return show;
			}
		},

		deleteShow: {
			type: new GraphQLNonNull(showType),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			async resolve(source, arguments, context, info) {
				if (!context.user.isAdmin) return rejectedPromise("Access denied");
				let show;

				try {
					let result = await db.query(
						`DELETE FROM public.show WHERE id = $1 RETURNING *;`,
						[ arguments.id ]);

					show = result.rows[0];
				} catch (error) {
					console.log(error);
					throw error;
				}

				return show;
			}
		},

	}
}

async function launchPuppeteer() {
	let browser = await puppeteer.launch({
		// headless: false,
		args: [
			'--proxy-server="direct://"',
			'--proxy-bypass-list=*'
		],
	});
	let page = await browser.newPage();
	await page.setExtraHTTPHeaders({'Accept-Language': 'en-US,en'});
	await page.setRequestInterception(true);
	page.on("request", request => {
		if (request.resourceType() !== "document") {
			request.abort();
		} else {
			request.continue();
		}
	});

	return {browser, page};
}

function stringToDate(string) {
	let month = {Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12};
	let chunks = (string || "").split(/[ .]+/).reverse();
	return new Date((chunks[0]||2030), (month[chunks[1]]||12)-1, (chunks[2]||28));
}
