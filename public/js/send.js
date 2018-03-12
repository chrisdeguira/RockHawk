var bodyParser=require("body-Parser");
var express = require('express')
    , router = express.Router();
var db = require('../../db');

function sendTest(){
    var collection = db.getDb().collection('feedback');
    var query = {"name":"test name"};
    collection.insertOne(query, function(err, res){
        assert.equal(null, err);
        console.log("Success");
        db.close();
    });
}
