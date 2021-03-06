process.chdir(__dirname)
require("./config.js")

let express = require("express")
let bodyParser = require("body-parser")
let graphqlHTTP = require("express-graphql")

let schema = require("./graphql")
let auth = require("./middleware/auth.js")

let app = express()

// app.use((req, res, next) => { setTimeout(() => next(), 1000) })
// TODO:
//  1. VLC
//  2. Feeds: Video / Rss / etc

app.use(bodyParser.json())

if (process.env.NODE_ENV !== "production")
	app.use((req, res, next) => {
		console.log(`${req.method} ${req.originalUrl}`)
		console.log(req.body)
		next()
	})

app.use(express.static("public"))
app.use("/api", auth(schema))

app.use(
	"/api",
	graphqlHTTP({
		schema,
		graphiql: process.env.NODE_ENV !== "production",
	})
)

app.use("/*", (req, res, next) => {
	res.sendFile(__dirname + "/public/index.html")
})

app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`))
