let dotenv = require("dotenv");

dotenv.load();
if (!process.env.PORT) process.env.PORT = 3000;

