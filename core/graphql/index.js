let graphql = require("graphql");
let db = require("../db");

let typeType = new graphql.GraphQLObjectType({
	name: "Type",
	fields: {
		id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
		name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) }
	}
});

module.exports = new graphql.GraphQLSchema(
	{
		query: new graphql.GraphQLObjectType({
			name: "Query",
			fields: {
				type: {
					type: typeType,
					args: {
						id: { type: graphql.GraphQLInt }
					},
					resolve(source, arguments, context, info) {
						return new Promise((resolve, reject) => {
							db.query("SELECT id, name FROM type WHERE id=$1;", [arguments.id], (err, res) => {
								if (err) reject(err);
								resolve(res.rows[0])
							})
						});
					}
				}
			}
		}),
		mutation: new graphql.GraphQLObjectType({
			name: "Mutation",
			fields: {
				bar: {
					type: new graphql.GraphQLNonNull(graphql.GraphQLString),
					resolve() {
						return "bar"
					}
				}
			}
		})
	}
);