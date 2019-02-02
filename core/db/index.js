let { Pool } = require("pg");
let pool = new Pool();

module.exports = {
	query: (text, params, callback) => {
		return pool.query(text, params, callback);
	}
};
