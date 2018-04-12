var express = require('express');
var mongo = require('mongodb');

var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://rockhawk:teamrockers@rockhawk-fmxoq.mongodb.net/test";

function getMarkers(){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.collection("mapMarkers").find().toArray(function(err, result) {
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

getMarkers();

module.exports = router;