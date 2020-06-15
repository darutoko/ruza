let { Pool } = require("pg")
let pool = new Pool()

module.exports = {
	query(text, params) {
		if (process.env.NODE_ENV !== "production") console.log(text)
		return pool.query(text, params)
	},
	client() {
		return pool.connect()
	},
	async thransactionExecute(transaction) {
		let result
		let client = await this.client()

		try {
			await client.query("begin;")
			result = await transaction(client)
			await client.query("commit;")
		} catch (error) {
			await client.query("rollback;")
			if (process.env.NODE_ENV !== "production") console.log(error.message)
			throw error
		} finally {
			client.release()
		}

		return result
	},
}
