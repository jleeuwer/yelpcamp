// Read the .env file 
require('dotenv').config();
const express                   = require("express");
const app                       = express();
const chalk                     = require("chalk");
const vmongoose                 = require("mongoose");
const vseeds                    = require("./seeds");
const userSeed                  = require("./seedusers");
const vpassport                 = require("passport");
const vlocalstrategy            = require("passport-local");
const vpassportlocalmongoose    = require("passport-local-mongoose");
const bodyParser                = require("body-parser");
const vMethodOverride           = require("method-override");
const flash                     = require("connect-flash");
const testcomment               = require("./testcomments");
const vasync                    = require("async");
const vmailer                   = require("nodemailer");
const vcrypto                   = require("crypto");

//  App settings
app.set("view engine", "ejs"); // Set view engine, so you dont have to specify the extension everytime
app.use(express.static(__dirname + "/public")); // Express public
app.use(bodyParser.urlencoded({extended: true}));
app.use(vMethodOverride("_method")); // Method override for PUT
app.use(flash()); // Flash Messages
app.locals.moment = require('moment'); // Berekenen van verschillen tussen datums

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

// Application Modules 
var mod_comment_routes      = require("./routes/comments");
var mod_campground_routes   = require("./routes/campgrounds");
var mod_index_routers       = require("./routes/index");
var mod_review_routes       = require("./routes/reviews");

// console.log(process.env.DATABASEURL);

//  Connect the model
// var envDBURL = process.env.DATABASEURL || "mongodb://localhost:27017/yelpcamp"
var envDBURL = process.env.DATABASEURL
vmongoose.set('useCreateIndex', true);
vmongoose.connect(envDBURL, { useNewUrlParser: true, useUnifiedTopology: true  });

var db = vmongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Schema Setup for campground, notifications, reviews and comments
var vCampGround     = require("./models/mcampground.js");
var vComment        = require("./models/mcomment.js");
var notifications   = require("./models/mnotifications.js");
var vReviews        = require("./models/mreviews.js");

// Pass current user to all routes
app.use(async function (req, res, next) {
    res.locals.vCurrentUser = req.user;
    if (req.user) {
        try {
            let founduser = await vUser.findById(req.user._id).populate("notifications", null, { isRead: false}).exec();
            // console.log("User " + founduser);
            res.locals.notifications = founduser.notifications.reverse();
            // console.log("Not" + founduser.notifications);
        } catch (err) {
            console.log("Something went wrong in reading the notifications" + " " + err.message);
        }
    } else {
        res.locals.notifications = [];
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(mod_index_routers);
app.use("/campgrounds", mod_campground_routes);
app.use("/campgrounds/:id/comments", mod_comment_routes);
app.use("/campgrounds/:id/reviews", mod_review_routes);

// Link to managing the API key for Google
// https://console.cloud.google.com/apis/credentials?project=testproject-279512&supportedpurview=project

// Generating test data
// console.log ("Test data " + process.env.GENERATE_TEST_DATA);
// Check for environment variable, set in .ENV 
if (process.env.GENERATE_TEST_DATA === "1" ) {
    console.log("Generating test data.....");
    vseeds();
};

// Fault route
app.get("*", function(req,res){
    // console.log("Sending youtube string back");
    res.send("Sorry, page not found....What are you doing with your life");
});

// Listen route
app.listen(process.env.PORT, function() { 
    var now = new Date();
    console.log(now.toUTCString(),'The Yelpcamp application has started. Server listening on port 3000'); 
    console.log(chalk.yellow('Yelpcamp') + ' has started' + chalk.black('!'));
  });

