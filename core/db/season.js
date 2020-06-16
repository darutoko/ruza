let pg = require("./pg")

module.exports = {
	list({ showId }) {
		return pg.query('select * from "season" where "showId" = $1;', [showId])
	},
}
