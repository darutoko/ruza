let jwt = require("jsonwebtoken");
let { graphql } = require("graphql");

function getUser(authorization = "") {
	let [prefix, token] = authorization.split(" ");
	let user = {};

	if (!token) return user;

	try {
		let data = jwt.verify(token, process.env.JWT_SECRET);
		user.username = data.username; user.isAdmin = data.isAdmin;
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.log(`Token was rejected: ${token}`);
			console.log(error.message);
		}
	}

	return user;
};

module.exports = (schema) => (req, res, next) => {
	if (req.body && req.body.variables && req.body.variables.username && req.body.variables.password) {
		graphql(schema, req.body.query, {}, req, req.body.variables, req.body.operationName)
			.then(result => {
				if (result.errors) {
					res.status(500);
				} else {
					result.token = jwt.sign(result.data.login, process.env.JWT_SECRET, { expiresIn: "12h" }); 
					res.status(200);
					res.set("Authorization", `Bearer ${result.token}`);
				}
				res.json(result);
			})
			.catch(error => next(error));
		return;
	}

	req.user = getUser(req.headers.authorization);
	next();
};