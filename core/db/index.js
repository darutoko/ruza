let { Pool } = require("pg");
let pool = new Pool();

module.exports = {
	query: (text, params) => {
		console.log(text);
		return pool.query(text, params);
	}
};
