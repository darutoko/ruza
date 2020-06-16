let { GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLScalarType, GraphQLObjectType } = require("graphql")

let dateType = new GraphQLScalarType({
	name: "Date",
	description: "Date format of YYYY-MM-DD",
	serialize: dateToString,
	parseValue: dateToString,
	parseLiteral(ast) {
		return ast
	},
})

let seasonType = new GraphQLObjectType({
	name: "Season",
	description: "Show season data",
	fields: {
		num: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's number",
		},
		directory: {
			type: GraphQLString,
			description: "Season's episodes location on disk",
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
			type: new GraphQLNonNull(dateType),
			description: "Season's next episode air date",
		},
		episodeNextAt: {
			type: new GraphQLNonNull(dateType),
			description: "Season's next episode air date",
		},
		episodeFinalAt: {
			type: new GraphQLNonNull(dateType),
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
			resolve(source) {
				let season = {}
				Object.keys(seasonType._fields).forEach(key => (season[key] = source[key]))
				return season
			},
		},
		seasons: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's total season number",
		},
		currentSeason: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's current season",
		},
		search: {
			type: GraphQLString,
			description: "Show's torrent search string",
		},
		uploaded: {
			type: GraphQLString,
			description: "Show's torrent upload user",
		},
	},
})

module.exports = {
	showType,
	seasonType,
}

function dateToString(date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0")
}
