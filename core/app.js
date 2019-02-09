require("./config.js");

let express = require("express");
let bodyParser = require("body-parser");
let graphqlHTTP = require("express-graphql");

let schema = require("./graphql");
let auth = require("./middleware/auth.js");

let app = express();

if (process.env.NODE_LOG) app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next() });
app.use(bodyParser.json());
app.use(express.static('public'));
app.use("/api", auth(schema));
app.use("/api", graphqlHTTP({
	schema,
	graphiql: process.env.GRAPHIQL
}));

app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));