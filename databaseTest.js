var express = require('express');
var mongo = require('mongodb');

var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://rockhawk:teamrockers@rockhawk-fmxoq.mongodb.net/test";

function sendFeedback(feedback){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.collection("feedback").insertOne(feedback, function(err, res) {
            if (err) throw err;
            console.log("Feedback sent to database");
            db.close();
        });
    });
}

function getFeedback(){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.collection("feedback").findOne({}, function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port);
});

getFeedback();