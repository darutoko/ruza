let escape = require("pg-escape");
let puppeteer = require("puppeteer");
let JoinMonster = require("join-monster").default;
let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString } = require("graphql");

let db = require("../db");
let { rejectedPromise } = require("./tools");
let { showType, seasonType } = require("./shows_types");

module.exports = {
	query: {
		show: {
			type: new GraphQLNonNull(showType),
			description: "One Show",
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			where: (showTable, arguments, context) => {
				return escape(`${showTable}.id = %s`, arguments.id);
			},
			resolve(source, arguments, context, info) {
				return JoinMonster(info, {}, sql => {
					return db.query(sql, []).then(res => res.rows);
				});
			}
		},

		shows: {
			type: new GraphQLList(new GraphQLNonNull(showType)),
			description: "List of all shows",
			resolve(source, arguments, context, info) {
				return JoinMonster(info, {}, sql => {
					return db.query(sql, []).then(res => res.rows);
				}, {dialect:'pg'});
			}
		},

		seasons: {
			type: new GraphQLList(new GraphQLNonNull(seasonType)),
			description: "List of all seasons of a show",
			args: {
				show_id: {
					type: new GraphQLNonNull(GraphQLInt)
				}
			},
			where: (seasonTable, arguments, context) => {
				return escape(`${seasonTable}.show_id = %s`, arguments.show_id);
			},
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

					let {browser, page} = await launchPuppeteer();
					await page.goto(`${show.url}episodes?season=${show.current_season}`);
					let dates = await page.$$eval(".airdate", divs => divs.map(div => div.textContent.trim()));
					let seasons = await page.$eval("#bySeason", select => (select.options[select.options.length-1].value * 1) || 1);
					await browser.close();
					
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

					if (show.seasons !== seasons) await db.query(`UPDATE public.show SET seasons = $1 WHERE id = $2;`, [ seasons, arguments.id ]);

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

		updateShow: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt)
				},
				current_season: {
					type: GraphQLInt
				},
				search: {
					type: GraphQLString
				},
				uploaded: {
					type: GraphQLString
				},
				directory: {
					type: GraphQLString
				},
			},
			async resolve(source, arguments, context, info) {
				if (!context.user.isAdmin) return rejectedPromise("Access denied");
				if (Object.keys(arguments).length <= 1) return 1;

				try {
					let result, show, values = [], keys = Object.keys(arguments).filter(key => ["current_season", "search", "uploaded"].includes(key));

					if (keys.length) {
						values = keys.map(key => arguments[key]);
						result = await db.query(`UPDATE public.show SET ${keys.map((key, i) => key + " = $"+(i+1)).join(", ")} WHERE id = \$${keys.length + 1} RETURNING *;`,
							[ ...values, arguments.id ]);
						show = result.rows[0];
					}

					if (arguments.directory) {
						if (!show) {
							result = await db.query(`SELECT * FROM public.show WHERE id = $1;`, [ arguments.id ]);
							show = result.rows[0];
						}
						result = await db.query(`UPDATE public.season SET directory = $1 WHERE show_id = $2 AND num = $3;`, [ arguments.directory, show.id, show.current_season ]);
					}
				} catch (error) {
					console.log(error);
					throw error;
				}

				return 1;
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
			'--proxy-bypass-list=*',
			'--no-sandbox',
			'--disable-setuid-sandbox'
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
	return new Date((chunks[0]||2084), (month[chunks[1]]||12)-1, (chunks[2]||28));
}
