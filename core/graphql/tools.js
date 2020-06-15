module.exports = {
	checkAuthorization(req) {
		if (!req.user.isAdmin) throw new Error("Access denied")
	},
	rejectedPromise(reason) {
		return Promise.reject(new Error(reason))
	},
}
