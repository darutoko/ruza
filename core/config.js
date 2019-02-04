let dotenv = require("dotenv");

dotenv.load();
if (!process.env.PORT) process.env.PORT = 3000;

if (process.env.NODE_ENV === "production") {
	process.env.NODE_LOG = false;
	process.env.GRAPHIQL = false;
} else {
	process.env.NODE_LOG = true;
	process.env.GRAPHIQL = true;
}
