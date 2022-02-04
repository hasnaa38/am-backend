const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes')
const mongoose = require('mongoose');
require("dotenv").config();

app.use(cors());
app.use('/', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());
app.use(routes);

mongoose.connect(`${process.env.MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

function start(port) {
  app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
  });
}

module.exports = { app, start };
