var express = require('express')
    , router = express.Router();
var db = require('../db');
var ObjectId = require('mongodb').ObjectID;
var bodyParser=require("body-Parser");

router.post('/test', function(req, res) {

});
module.exports = router;
var uri = "mongodb+srv://rockhawk:teamrockers@RockHawk.mongodb.net/rockhawkdb";
MongoClient.connect(uri, function(err, client) {
    const collection = client.db("rockhawkdb").collection("feedback");
    // perform actions on the collection object
    client.close();
});