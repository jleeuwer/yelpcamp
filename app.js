require('dotenv').config();
const express = require("express");
const app = express();
const chalk = require("chalk");
const vmongoose = require("mongoose");
var vseeds = require("./seeds");
const vpassport = require("passport");
const vlocalstrategy = require("passport-local");
const vpassportlocalmongoose = require("passport-local-mongoose");
const bodyParser = require("body-parser");
const vMethodOverride = require("method-override");
const flash = require("connect-flash");


// Schema Setup
var vUser = require("./models/user.js");

// Authentication
app.use(require("express-session")({
    secret: "Passat is the best car",
    resave: false,
    saveUninitialized: false,
    cookie:{_expires : 600000000}
}));
app.use(vpassport.initialize());
app.use(vpassport.session());
vpassport.use(new vlocalstrategy(vUser.authenticate()));
vpassport.serializeUser(vUser.serializeUser());
vpassport.deserializeUser(vUser.deserializeUser());


//  App settings
app.set("view engine", "ejs"); // Set view engine, so you dont have to specify the extension everytime
app.use(express.static(__dirname + "/public")); // Express public
app.use(bodyParser.urlencoded({extended: true}));
app.use(vMethodOverride("_method")); // Method override for PUT
app.use(flash()); // Flash Messages
app.locals.moment = require('moment'); // Berekenen van verschillen tussen datums


// Application Modules 
var mod_comment_routes = require("./routes/comments");
var mod_campground_routes = require("./routes/campgrounds");
var mod_index_routers = require("./routes/index");

// console.log(process.env.DATABASEURL);

//  Connect the model
var envDBURL = process.env.DATABASEURL || "mongodb://localhost:27017/yelpcamp"
vmongoose.connect(envDBURL, { useNewUrlParser: true, useUnifiedTopology: true  });
// vseeds();

// Schema Setup
var vCampGround = require("./models/mcampground.js");
var vComment = require("./models/mcomment.js");

// Pass current user to all routes
app.use(function (req, res, next) {
    res.locals.vCurrentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(mod_index_routers);
app.use("/campgrounds", mod_campground_routes);
app.use("/campgrounds/:id/comments", mod_comment_routes);

// Link to managing the API key for Google
// https://console.cloud.google.com/apis/credentials?project=testproject-279512&supportedpurview=project



// Fault route
app.get("*", function(req,res){
    // console.log("Sending youtube string back");
    res.send("Sorry, page not found....What are you doing with your life");
});

// Listen route
app.listen(3000, function() { 
    console.log('The Yelpcamp application has started. Server listening on port 3000'); 
    console.log(chalk.yellow('Yelpcamp') + ' has started' + chalk.black('!'));
  });

