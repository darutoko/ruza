let { GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLBoolean } = require("graphql")

let db = require("../db")
let { checkAuthorization } = require("./tools")
let { deckType, cardType, definitionType } = require("./decks_types")

module.exports = {
	query: {
		decks: {
			type: new GraphQLList(new GraphQLNonNull(deckType)),
			description: "List of all decks",
			resolve(source, arguments, context, info) {
				return db.deck.all().then(res => res.rows)
			},
		},

		deck: {
			type: new GraphQLNonNull(deckType),
			description: "Deck",
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return db.deck.one(arguments).then(res => res.rows[0])
			},
		},

		cards: {
			type: new GraphQLList(new GraphQLNonNull(cardType)),
			description: "List of all cards in deck",
			args: {
				deckId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				return db.card.byDeck(arguments).then(res => res.rows)
			},
		},

		cardsSubset: {
			type: new GraphQLList(new GraphQLNonNull(cardType)),
			description: "List of cards matching subset",
			args: {
				deckId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				limit: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				subset: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				return db.card.subset(arguments).then(res => res.rows)
			},
		},

		yandexDictionary: {
			type: new GraphQLList(new GraphQLNonNull(definitionType)),
			description: "List of all definitions",
			args: {
				text: {
					type: new GraphQLNonNull(GraphQLString),
				},
				lang: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				return db.deck.getYandexDictionary(arguments)
			},
		},
	},
	mutation: {
		addDeck: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				name: {
					type: new GraphQLNonNull(GraphQLString),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.deck.create(arguments).then(res => res.rowCount)
			},
		},

		deleteDeck: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.deck.delete(arguments).then(res => res.rowCount)
			},
		},

		updateDeck: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				memorizeSize: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				testSize: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				streakSize: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				isStrakDegrades: {
					type: new GraphQLNonNull(GraphQLBoolean),
				},
				degradationInterval: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				degradationStep: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.deck.update(arguments).then(res => res.rowCount)
			},
		},

		addCard: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				input: {
					type: new GraphQLNonNull(GraphQLString),
				},
				front: {
					type: new GraphQLNonNull(GraphQLString),
				},
				back: {
					type: new GraphQLNonNull(GraphQLString),
				},
				testByFront: {
					type: new GraphQLNonNull(GraphQLBoolean),
				},
				deckId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.card.create(arguments).then(res => res.rowCount)
			},
		},

		updateCardStreak: {
			type: new GraphQLNonNull(GraphQLInt),
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				isTestPassed: {
					type: new GraphQLNonNull(GraphQLBoolean),
				},
			},
			resolve(source, arguments, context, info) {
				return db.card.updateStreak(arguments).then(res => res.rowCount)
			},
		},

		moveCards: {
			type: new GraphQLList(new GraphQLNonNull(cardType)),
			args: {
				deckId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				ids: {
					type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
				},
				newDeckId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.card
					.updateDeck(arguments)
					.then(_ => db.card.byDeck(arguments))
					.then(res => res.rows)
			},
		},

		deleteCards: {
			type: new GraphQLList(new GraphQLNonNull(cardType)),
			args: {
				deckId: {
					type: new GraphQLNonNull(GraphQLInt),
				},
				ids: {
					type: new GraphQLList(new GraphQLNonNull(GraphQLInt)),
				},
			},
			resolve(source, arguments, context, info) {
				checkAuthorization(context)
				return db.card
					.delete(arguments)
					.then(_ => db.card.byDeck(arguments))
					.then(res => res.rows)
			},
		},
	},
}
