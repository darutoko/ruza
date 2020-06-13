let pg = require("./pg")

module.exports = {
	all() {
		return pg.query("select * from show left join season on show.id = season.show_id and show.current_season = season.num;")
	},
	one({ id }) {
		return pg.query(
			"select * from show left join season on show.id = season.show_id and show.current_season = season.num where show.id = $1;",
			[id]
		)
	},
}
