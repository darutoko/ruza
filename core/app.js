require("./config.js");

let express = require("express");
let bodyParser = require("body-parser");

let app = express();

app.use((req, res, next) => { console.log(`${req.method} ${req.originalUrl}`); next() });
app.use(bodyParser.json());
app.use(express.static('public'));

app.listen(process.env.PORT, () => console.log(`Listening at port ${process.env.PORT}`));