require("./config.js");

let express = require("express");
let bodyParser = require("body-parser");
let graphqlHTTP = require("express-graphql");

let schema = require("./graphql");

let app = express();

app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next() });
app.use(bodyParser.json());
app.use(express.static('public'));
app.use("/api", graphqlHTTP({
	schema,
	graphiql: true
}));

app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));