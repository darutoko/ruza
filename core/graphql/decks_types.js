let { GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLObjectType, GraphQLList } = require("graphql")

let deckType = new GraphQLObjectType({
	name: "Deck",
	description: "Deck of flashcards",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Deck ID",
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Deck name",
		},
		memorizeSize: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Size of memorize queue",
		},
		testSize: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Size of test queue",
		},
		streakSize: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Numoer of points for Card to become completed",
		},
		isStrakDegrades: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "Flag to show if Cards in this Deck are degrading",
		},
		degradationInterval: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Nuber of idle days for Card to loose its sterak",
		},
		degradationStep: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Number of points to decrease Card's streak for",
		},
		totalCards: {
			type: GraphQLInt,
			description: "Number of Cards in the Deck",
		},
		completedCards: {
			type: GraphQLInt,
			description: "Number of completed Cards",
		},
		failedCards: {
			type: GraphQLInt,
			description: "Number of failed Cards",
		},
	},
})

let cardType = new GraphQLObjectType({
	name: "Card",
	description: "Flashcard content",
	fields: {
		id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Card ID",
		},
		input: {
			type: new GraphQLNonNull(GraphQLString),
			description: "String for user to input during test",
		},
		front: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Front side of the Card",
		},
		back: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Back side of the Card",
		},
		streak: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "Current number of points",
		},
		testByFront: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "Flag to use front side of the Card it test",
		},
		deckId: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "ID of Deck that Card belongs to",
		},
		updatedAt: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Card last test date",
		},
	},
})

let definitionType = new GraphQLObjectType({
	name: "Definition",
	description: "Definition from Yandex Dictionary",
	fields: {
		text: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Text",
		},
		pos: {
			type: new GraphQLNonNull(GraphQLString),
			description: "Pos",
		},
		ts: {
			type: GraphQLString,
			description: "Transcription",
		},
		tr: {
			type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
			description: "Translations",
		},
	},
})

module.exports = {
	deckType,
	cardType,
	definitionType,
}

/*
Total: all cards in the deck.
Completed: cards that have "streak" value equal or more than deck's "streakSize" value.
Incomplete: cards that have "streak" value less than deck's "streakSize" value.
Progressed: cards that have "streak" value less than deck's "streakSize" value and greater than 0.
Failed: cards that have "streak" value equal to 0.

Total = Completed + Incomplete = Completed + Progressed + Failed
*/
