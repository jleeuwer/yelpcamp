var express = require("express");
var router = express.Router({mergeParams: true});
var vpassport = require("passport");
var vUser = require("../models/user.js");


// Main landing page
router.get("/", function(req, res){
    // res.send("This will be our landing page soon");
    res.render("landing.ejs");
});


// AUTHENTICATION ROUTES

// show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'}); 
 });
 
 //show login form
 router.get("/login", function(req, res){
    res.render("login", {page: 'login'}); 
 });

router.post("/register", function(req, res){
    var vIsAdmin = false; // Default a user is no admin, only when he enters the correct secret code
    var vuser = new vUser({username: req.body.username});
    var vPassword = req.body.password;
    var vadminCode = req.body.admincode;
    if (vadminCode === 'YelpCamp') {
        vuser.vIsAdmin = true;
        console.log(vuser);
    };
    vUser.register(vuser, vPassword, function(err, user) {
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        // if(err) {
        //     req.flash("error", err.message);
        //     return res.render("register");
        // } 
        // console.log(user);
        vpassport.authenticate("local")(req, res, function() {
            req.flash("succes", "Welcome to yelpcamp" + user.username);
            res.redirect("/campgrounds");
        });
    });
});



// Handling the login logic
router.post("/login", vpassport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
    }), function(req, res){

});

// Logout routes
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You are no longer logged in!");
    res.redirect("/");
});


module.exports = router;
