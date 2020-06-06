var express = require("express");
var router = express.Router({mergeParams: true});
var vCampGround = require("../models/mcampground");
var vMiddleware = require("../middleware"); // If requiring a directory, it will require the index.js in that directory
// Geocoder module
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

// Debug
console.log(options);
 
var geocoder = NodeGeocoder(options);

// Index Route - show all data
router.get("/", function(req, res){
    vCampGround.find({}, function(err, allcampGrounds) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
        } else {
            // console.log (allcampGrounds);
            res.render("campground/index.ejs", {pcampgrounds: allcampGrounds, page: 'campgrounds', vCurrentUser: req.user});
        };
    });
});

// New route - Show form to add campground
router.get("/new", vMiddleware.IsLoggedIn , function(req, res){
    res.render("campground/new.ejs");
});

// Create Route - add campground to the DB
router.post("/", vMiddleware.IsLoggedIn , function(req, res){
    var vAuthor = {
        id: req.user._id,
        username: req.user.username
    };

    // Init geo variables
    var vlocation = "Nothing found yet";
    var vlat = 0;
    var vlng = 0;

    geocoder.geocode(req.body.Location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        vlat = data[0].latitude;
        vlng = data[0].longitude;
        vlocation = data[0].formattedAddress;
        // Debug information
        console.log(req.body.Location);
        console.log(vlat);
        console.log(vlng);
        console.log(vlocation);

        var newCampground = {Name: req.body.vName, Image: req.body.vUrl, Description: req.body.Description, Author: vAuthor, Price: req.body.Price, Location: vlocation, Lat: vlat, Lng: vlng};

        vCampGround.create(newCampground, function(err, newlycreatedCampground) {
            if(err){
                req.flash("error", "There was a problem accessing the data");
            } else {
                // console.log(newlycreatedCampground);
                res.redirect("/campgrounds");
            };
        });
    });
// vcampGrounds.push(newCampground);
});

// Show Route - Show data of one instance from the dataset
router.get("/:id", vMiddleware.IsLoggedIn , function (req, res) {
    vCampGround.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            // console.log(foundCampground);
            res.render("campground/show.ejs", {campground: foundCampground});
        };
    });
});

// Edit Campground Route
router.get("/:id/edit", vMiddleware.checkCampgroundOwnership, function(req, res) {
    vCampGround.findById(req.params.id, function(err, foundCampground) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            // console.log(foundCampground);
            res.render("campground/edit", {campground: foundCampground});
        };
    });
});

// Update Campground Route
router.put("/:id", function (req, res) {
    console.log("Saving");
    console.log(req.body.updCampground);
    // findByIdAndUpdate has been depracated, so added new function
    // vCampGround.findByIdAndUpdate(req.params.id, req.body.updCampground, function (err, vCampGround) {
    geocoder.geocode(req.body.updCampground.Location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.updCampground.Lat = data[0].latitude;
        req.body.updCampground.Lng = data[0].longitude;
        req.body.updCampground.Location = data[0].formattedAddress;
        // Debug info
        console.log(req.body.updCampground.Location);
        console.log(req.body.updCampground.Lat);
        console.log(req.body.updCampground.Lng);
        console.log(req.body.updCampground.Location);
        
        vCampGround.findOneAndUpdate({_id: req.params.id}, {$set: req.body.updCampground}, {new: true, useFindAndModify: false}, function (err, vCampGround) {
            if (err) {
                res.redirect("/campgrounds");
            } else {
                req.flash("success", "Campground successfully modified");
                res.redirect("/campgrounds/" + req.params.id)
            };
        });
    });
});

// Destroy Campground Route
router.delete("/:id", vMiddleware.checkCampgroundOwnership, function (req, res) {
    // res.send("You want to destroy a campground");
    vCampGround.findOneAndDelete({_id: req.params.id}, function (err) {
        if (err) {
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground successfully deleted");
            res.redirect("/campgrounds");
        };
    });
});

module.exports = router;

