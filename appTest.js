var express = require("express");
var app = express();
var port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/addname", (req, res) => {

});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});