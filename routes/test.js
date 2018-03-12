var bodyParser=require("body-Parser");
var express = require('express')
    , router = express.Router();
var db = require('../db');
//support parsing of application/json type post data
router.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/signupServer', function(req, res) {
    var email = req.body.email;
    var pwd = req.body.pwd;
    console.log(email);
    console.log(pwd);
    var collection = db.getDb().collection('feedback');
//res.setHeader('Content-Type', 'application/json');
    var query = {"name":"test name"};
    collection.insertOne(query, function(err, res){
        assert.equal(null, err);
        console.log("Success");
        db.close();
    });


});
//})
module.exports = router;