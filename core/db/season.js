let pg = require("./pg")

module.exports = {
	list({ show_id }) {
		return pg.query("select * from season where show_id = $1;", [show_id])
	},
}
