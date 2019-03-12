let { GraphQLNonNull, GraphQLList, GraphQLInt, GraphQLString, GraphQLScalarType } = require("graphql");
let { getJMObjectType } = require("./tools");

let dateType = new GraphQLScalarType({
	name: "Date",
	description: "Date format of YYYY-MM-DD",
	serialize: dateToString,
	parseValue: dateToString,
	parseLiteral(ast) {
		console.error(JSON.stringify(ast));
		return ast;
	}
});

let seasonType = getJMObjectType({
	name: "Season",
	uniqueKey: ["num", "show_id"],
	sqlTable: "season",
	description: "Show season data",
	fields: {
		num: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's number"
		},
		directory: {
			type: GraphQLString,
			description: "Season's episodes location on disk"
		},
		episodes_total: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's total episodes number"
		},
		episodes_aired: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Season's episodes aired"
		},
		episode_last_at: {
			type: new GraphQLNonNull(dateType),
			description: "Season's next episode air date"
		},
		episode_next_at: {
			type: new GraphQLNonNull(dateType),
			description: "Season's next episode air date"
		},
		episode_final_at: {
			type: new GraphQLNonNull(dateType),
			description: "Season's final episode air date"
		},
	}
});

let showType = getJMObjectType({
	name: "Show",
	uniqueKey: "id",
	sqlTable: "show",
	description: "Show is what ypu watch on TV",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's unique id"
		},
		url: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Show's url"
		},
		title: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Show's title"
		},
		season: {
			type: seasonType,
			description: "Show's season data",
			sqlJoin: (showTable, seasonTable, arguments) => `${showTable}.id = ${seasonTable}.show_id AND ${showTable}.current_season = ${seasonTable}.num`
		},
		seasons: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's total season number"
		},
		current_season: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Show's current season"
		},
		search: {
			type: GraphQLString,
			description: "Show's torrent search string"
		},
		uploaded: {
			type: GraphQLString,
			description: "Show's torrent upload user"
		},
	}
});

module.exports = {
	showType
}

function dateToString(date) {
	return date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
}
