let { GraphQLObjectType } = require("graphql");

module.exports = {
	getJMObjectType(object) {
		let keys = ["uniqueKey", "sqlTable"];
		let newObjectType = new GraphQLObjectType(object);
		newObjectType._typeConfig = keys.reduce((accumulator, key) => { accumulator[key] = object[key]; return accumulator; }, {});
		return newObjectType;
	},

	rejectedPromise(reason) { return Promise.reject(new Error(reason)) }
};
