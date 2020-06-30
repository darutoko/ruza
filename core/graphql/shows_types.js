let { GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLScalarType, GraphQLObjectType } = require("graphql")

let seasonType = new GraphQLObjectType({
	name: "Season",
	description: "Show season data",
	fields: {
		num: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's number",
		},
		episodesTotal: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's total episodes number",
		},
		episodesAired: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's episodes aired",
		},
		episodeLastAt: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Season's next episode air date",
		},
		episodeNextAt: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Season's next episode air date",
		},
		episodeFinalAt: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Season's final episode air date",
		},
	},
})

let showType = new GraphQLObjectType({
	name: "Show",
	description: "Show is what ypu watch on TV",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's unique id",
		},
		url: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Show's url",
		},
		title: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Show's title",
		},
		season: {
			type: seasonType,
			description: "Show's season data",
			resolve_(source) {
				let season = {}
				Object.keys(seasonType._fields).forEach(key => (season[key] = source[key]))
				if (!season.num) return null
				return season
			},
		},
		seasonsTotal: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's total season number",
		},
		currentSeason: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's current season",
		},
	},
})

module.exports = {
	showType,
	seasonType,
}
