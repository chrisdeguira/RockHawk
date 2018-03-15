var express=require("express");
var http=require("http");
var path=require("path");
var bodyParser=require("body-Parser");
var handlebars=require("express-handlebars").create({defaultLayout:"main"});
var db = require('./db')
//yellow marks for db opers
var app=express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var publicPath=path.resolve(__dirname, "public");
app.use("/styles",  express.static(__dirname + '/public/css'));
app.use("/scripts", express.static(__dirname + '/public/js'));
app.use("/images",  express.static(__dirname + '/public/resources'));
app.use(express.static(publicPath));
app.use(require('./routes/test'));

var dbLink=require("./config.json");
var url = dbLink.devServer.url;
db.connect(url, function(err) {
//in call back func, start web server.
    if (err) {
        console.log('Unable to connect to Mongo: ' + err);
        process.exit(1);
    } else {
        var listener=http.createServer(app).listen(process.env.PORT||3000);
        console.log('Server is listening at port'+listener.address().port);
    }
});
app.get("/",function(req,res){
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/feedback',function(req,res){
    console.log("send to feedback page");
    res.sendFile(__dirname + "/public/feedback.html");
});

app.get('/liveMap',function(req,res){
    console.log("send to live map page");
    res.sendFile(__dirname + "/public/livemap.html");
});

app.get('/main',function(req,res){
    console.log("send to the home page");
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/test',function(req,res){
    console.log("send to the home page");
    res.sendFile(__dirname + "/public/test.html");
});


app.use(function(req,res, next){
    //nnext is callback function afer this function is done
    //do not put () after next or it is a function call
    res.type("text/plain");
    res.status(404);
    res.send("404-Not Found");
})

app.set('db',db);
module.exports.app=app;