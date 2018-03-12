var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbLink=require("./config.json");
var url = dbLink.devServer.url;
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var collection=db.collection('feedback');
    collection.insertOne({name:"Test User",pwd:"password",phone:"4784453344"},
        function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
});