let { Pool } = require("pg");
let pool = new Pool();

module.exports = {
	query: (text, params) => {
		if (process.env.NODE_LOG) console.log(text);
		return pool.query(text, params);
	},
	client() {
		return pool.connect();
	}
};
