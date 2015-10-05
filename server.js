"use strict";

var express = require("express");
var compression = require("compression");
var port = 8888;

var app = express();
app.use(compression());
app.use(express.static(__dirname + "/public"));

app.listen(process.env.PORT || port);
