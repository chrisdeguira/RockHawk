var express=require("express");
var session=require("express-session");
var http=require("http");
var path=require("path");
var bodyParser=require("body-parser");
var db = require('./db');
var fs = require('fs');
var multer = require('multer');


//yellow marks for db opers
var app=express();
app.use(require('./routes/test'));
app.use(session({
    secret: 'LJN92-20Vs-A1dl2KX',
    resave: true,
    saveUninitialized: true
}));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;


var publicPath=path.resolve(__dirname, "public");
app.use("/styles",  express.static(__dirname + '/public/css'));
app.use("/scripts", express.static(__dirname + '/public/js'));
app.use("/images",  express.static(__dirname + '/public/resources'));
app.use(express.static(publicPath));

var dbLink=require("./config.json");
var url = dbLink.devServer.url;
db.connect(url, function(err) {
//in call back func, start web server.
    if (err) {
        console.log('Unable to connect to Mongo: ' + err);
        process.exit(1);
    } else {
        var listener=http.createServer(app).listen(process.env.PORT||3000);
        console.log('Server is listening on port: '+listener.address().port);
    }
});

var auth = function(req, res, next) {
    if (req.session && req.session.user === "staffMember" && req.session.admin)
        return next();
    else
        return res.sendStatus(401);
};


app.get("/",function(req,res){
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/feedback',function(req,res){
    console.log("send to feedback page");
    res.sendFile(__dirname + "/public/feedback.html");
});

app.get('/livemap',function(req,res){
    console.log("send to live map page");
    res.sendFile(__dirname + "/public/livemap.html");
});

app.get('/trailedit',function(req,res){
    console.log("send to edit trail page");
    res.sendFile(__dirname + "/public/editLivemapTrails.html");
});

app.get('/main',function(req,res){
    console.log("send to the home page");
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/donate',function(req,res){
    console.log("send to the donate page");
    res.sendFile(__dirname + "/public/donate.html");
});

app.get('/editMap',auth,function(req,res){
    console.log("send a staff member to the map editing page");
    res.sendFile(__dirname + "/public/editLivemap.html");
});

app.get('/loginPage',function(req,res){
    if (req.session && req.session.user === "staffMember" && req.session.admin) {
        res.redirect("options");
    }
    console.log("send to the login page");
    res.sendFile(__dirname + "/public/login.html");
});


//--------- DB ACCESS ROUTES -----------


var MongoClient = require('mongodb').MongoClient;
var feedbackSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    rating: String,
    comment: String
});
var Feedback = mongoose.model("Feedback", feedbackSchema);
app.post("/sendFeedback",function(req, res) {
    var data = new Feedback(req.body);
    if(data["firstName"]!==null && data["lastName"]!==null && data["email"]!==null) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("rockhawkdb");
            dbo.collection("feedback").insertOne(data, function (err, res2) {
                if (err) throw err;
                console.log("Feedback sent to database");
                db.close();
                res.redirect("feedback");
            });
        });
    }
    else{
        console.log("Invalid feedback was rejected");
        console.log(req.body);
        res.redirect("feedback");
    }
});

app.get("/getFeedback",function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.collection("feedback").find({}).toArray(function(err, result){
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
});

app.get("/getMarkers",function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.collection("mapMarkers").find({}).toArray(function(err, result){
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
});

app.get("/getTrails",function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rockhawkdb");
        dbo.collection("mapTrails").find({}).toArray(function(err, result){
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
});
var picName;
var Storage = multer.diskStorage({

    destination: function(req, file, callback) {

        callback(null, "./public/resources/markers");

    },

    filename: function(req, file, callback) {
        picName = file.fieldname + "_" + Date.now() + "_" + file.originalname;
        callback(null, picName);

    }

});

var upload = multer({

    storage: Storage

}).array("image", 1); //Field name and max count

app.post("/upload", function(req, res) {

    upload(req, res, function(err) {

        if (err) {

            return res.end("Something went wrong!");

        }
        var data = {
            coords: {lat: parseFloat(req.body.currentLat), lng: parseFloat(req.body.currentLng)},
            content: "<div style='float:left'><img height=100px width=100px src='resources/markers/"+picName+"'></div><div style='float:right; padding: 10px;'><b>"+req.body.markerTitle+"</b><br/>"+req.body.markerDesc+"</div>"
        };
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("rockhawkdb");
            dbo.collection("mapMarkers").insertOne(data, function (err, res2) {
                if (err) throw err;
                console.log("new map marker created");
                db.close();
            });
        });
        return res.redirect("editMap");

    });

});
//-----------------LOGIN/LOGOUT ROUTES--------------------


// Login endpoint
app.get('/login', function (req, res) {
    if (!req.query.username || !req.query.password) {
        res.redirect("loginPage");
    } else if(req.query.username === "username" && req.query.password === "password") {
        req.session.user = "staffMember";
        req.session.admin = true;
        res.redirect("options");
    }
    else{
        res.redirect("loginPage");
    }
});

// Logout endpoint
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect("main");
});

app.get('/options', auth, function (req, res) {
    console.log("send a staff member to the staff tools page");
    res.sendFile(__dirname + "/public/options.html");
});
app.get('/view', auth, function (req, res) {
    console.log("send a staff member to the feedback viewing page");
    res.sendFile(__dirname + "/public/view.html");
});

//----------------------------------------------------


app.use(function(req,res, next){
    //nnext is callback function afer this function is done
    //do not put () after next or it is a function call
    res.type("text/plain");
    res.status(404);
    res.send("404-Not Found");
});

app.set('db',db);
module.exports.app=app;