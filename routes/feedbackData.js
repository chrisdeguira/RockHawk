var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://rockhawk:teamrockers@rockhawk-shard-00-00-fmxoq.mongodb.net:27017,rockhawk-shard-00-01-fmxoq.mongodb.net:27017,rockhawk-shard-00-02-fmxoq.mongodb.net:27017/test?ssl=true&replicaSet=RockHawk-shard-0&authSource=admin";
var nameSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
});
var User = mongoose.model("User", nameSchema);

app.post("/sendFeedback", (req, res) => {
    var myData = new User(req.body);
    console.log(myData);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.createCollection("test", function(err, res){
            if (err) throw err;

            db.close();
        });
        dbo.collection("test").insertOne(myData, function(err, res) {
            if (err) throw err;
            console.log("Feedback sent to database");
            db.close();
        });
    });
});






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
