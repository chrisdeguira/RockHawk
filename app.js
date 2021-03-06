var express=require("express");
var router = express.Router();
var session=require("express-session");
var http=require("http");
var path=require("path");
var bodyParser=require("body-parser");
var db = require('./db');
var fs = require('fs');
var multer = require('multer');
var app=express();

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(require('./routes/test'));
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

//This controls the authentication through an express session
var auth = function(req, res, next) {
    if (req.session && req.session.user === "staffMember" && req.session.admin)
        return next();
    else
        res.redirect("loginPage");
    res.redirect("loginPage");
};

//-----------------------Standard Routes-----------------------
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

app.get('/main',function(req,res){
    console.log("send to the home page");
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/donate',function(req,res){
    console.log("send to the donate page");
    res.sendFile(__dirname + "/public/donate.html");
});

//requires authentication
app.get('/editMapMarkers',auth,function(req,res){
    console.log("send a staff member to the map marker editing page");
    res.sendFile(__dirname + "/public/editLivemap.html");
});

//requires authentication
app.get('/editMapTrails',auth,function(req,res){
    console.log("send a staff member to the map trail editing page");
    res.sendFile(__dirname + "/public/editLivemapTrails.html");
});

//if the user has already logged in, bypass the login page
app.get('/loginPage',function(req,res){
    if (req.session && req.session.user === "staffMember" && req.session.admin) {
        res.redirect("options");
    }
    console.log("send to the login page");
    res.sendFile(__dirname + "/public/login.html");
});

//requires authentication
app.get('/options', auth, function (req, res) {
    console.log("send a staff member to the staff tools page");
    res.sendFile(__dirname + "/public/options.html");
});
//requires authentication
app.get('/view', auth, function (req, res) {
    console.log("send a staff member to the feedback viewing page");
    res.sendFile(__dirname + "/public/view.html");
});


//----------------------- DB ACCESS ROUTES ----------------------

var MongoClient = require('mongodb').MongoClient;
//set up the schema for feedback
var feedbackSchema = new mongoose.Schema({
    timeStamp: String,
    firstName: String,
    lastName: String,
    email: String,
    rating: String,
    comment: String
});

//Route for sending feedback
var Feedback = mongoose.model("Feedback", feedbackSchema);
app.post("/sendFeedback",function(req, res) {
    var data = new Feedback(req.body);
    if(data["firstName"]!=="" && data["lastName"]!=="" && data["email"]!=="") {
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
        res.redirect("feedback");
    }
});

//retrieve feedback from the database
app.get("/getFeedback", auth, function(req, res) {
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

//retrieve markers from the database
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

//retrieve the trails from the database
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

//This sets up the storage for the pictures on the server
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

//This is the file route which accepts a multi-part form request
app.post("/upload", auth, function(req, res) {
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
                console.log("A new map marker was created");
                db.close();
            });
        });
        return res.redirect("editMapMarkers");
    });
});

//This route sends all of the trail data from the edit trail tool to the database
app.post("/addTrail", auth, function(req, res) {
    var points = JSON.parse(req.body.pointData);
    if(points.length>0){
        var data = {
            path: points,
            geodesic: true,
            strokeColor: req.body.trailColor,
            strokeOpacity: 1,
            strokeWeight: 10,
            name: req.body.trailTitle
        };
        MongoClient.connect(url, function (err, db) {
            if (err){
                console.log('Error creating trail');
                console.log(err);
                res.redirect("editMapTrails");
            }
            var dbo = db.db("rockhawkdb");
            dbo.collection("mapTrails").insertOne(data, function (err, res2) {
                if (err) throw err;
                console.log("A new trail was created");
                db.close();
            });
        });
    }
    res.redirect("editMapTrails");
});

//-------------------------LOGIN/LOGOUT ROUTES-----------------------
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


//404 if not found
app.use(function(req,res, next){
    res.type("text/plain");
    res.status(404);
    res.send("404-Not Found");
});

app.set('db',db);
module.exports.app=app;