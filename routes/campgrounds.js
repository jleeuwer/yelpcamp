var express         = require("express");
var router          = express.Router({mergeParams: true});
var vCampGround     = require("../models/mcampground");
var vMiddleware     = require("../middleware"); // If requiring a directory, it will require the index.js in that directory
// Geocoder module
var NodeGeocoder    = require('node-geocoder');
var Notification    = require("../models/mnotifications.js");
var vUser           = require("../models/user.js");
var Review          = require("../models/mreviews.js");
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);


// Index Route - show all data
router.get("/", function(req, res){
    if (req.query.vsearch) {
        if (process.env.DEBUG==="1") {
            console.log("Finding campgrounds based on search pattern");
        };
        const regex = new RegExp(vMiddleware.escapeRegex(req.query.vsearch), 'gi');
        vCampGround.find({ Name: regex }, function(err, allcampGrounds) {
            if(err){
                req.flash("error", "There was a problem accessing the data");
            } else {
                if (allcampGrounds.length === 0 ) {
                    req.flash("error", "No matches were found. Please try with other search criteria");
                    res.redirect("/");
                } else {
                    res.render("campground/index.ejs", {pcampgrounds: allcampGrounds, page: 'campgrounds', vCurrentUser: req.user});
                }
            };
        });        
    } else {
        if (process.env.DEBUG==="1") {
            console.log("Finding all campgrounds");
        };
        vCampGround.find({}, function(err, allcampGrounds) {
            if(err){
                req.flash("error", "There was a problem accessing the data");
            } else {
                if (process.env.DEBUG==="1") {
                    console.log(allcampGrounds);
                };
                res.render("campground/index.ejs", {pcampgrounds: allcampGrounds, page: 'campgrounds', vCurrentUser: req.user});
            };
        });
    };
});

// New route - Show form to add campground
router.get("/new", vMiddleware.IsLoggedIn , function(req, res){
    res.render("campground/new.ejs");
});

// Create Route - add campground to the DB
router.post("/", vMiddleware.IsLoggedIn , async function(req, res){
    var vAuthor = {
        id: req.user._id,
        username: req.user.username
    };

    // Init geo variables
    var vlocation = "Nothing found yet";
    var vlat = 0;
    var vlng = 0;

    try {
        const geoLoc = await geocoder.geocode(req.body.Location);
        // if (err || !data.length) {
        //     req.flash('error', err.message);
        //     return res.redirect('back');
        // }
        vlat = geoLoc[0].latitude;
        vlng = geoLoc[0].longitude;
        vlocation = geoLoc[0].formattedAddress;

        var newCampground = {Name: req.body.vName, Image: req.body.vUrl, Description: req.body.Description, Author: vAuthor, Price: req.body.Price, Location: vlocation, Lat: vlat, Lng: vlng};

        let newlycreatedCampground = await vCampGround.create(newCampground); 
        // Create Notification
        vMiddleware.CreateNotification(req.user._id, req.user.username, newlycreatedCampground.id, 1)

    } catch (err) {
        req.flash("error", err.message);
        res.redirect('back');
    };
    res.redirect("/campgrounds");
});

// Show Route - Show data of one instance from the dataset
router.get("/:id", vMiddleware.IsLoggedIn , function (req, res) {
    // vCampGround.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground) {
    //     if(err){
    //         req.flash("error", "There was a problem accessing the data");
    //         res.redirect("/campgrounds");
    //     } else {
    //         res.render("campground/show.ejs", {campground: foundCampground});
    //     };
    // });
    //find the campground with provided ID
    vCampGround.findById(req.params.id).populate("comments likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            //render show template with that campground
            res.render("campground/show", {campground: foundCampground});
        }
    });
});

// Edit Campground Route
router.get("/:id/edit", vMiddleware.checkCampgroundOwnership, function(req, res) {
    vCampGround.findById(req.params.id, function(err, foundCampground) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            res.render("campground/edit", {campground: foundCampground});
        };
    });
});

// Update Campground Route
router.put("/:id", async function (req, res) {
    try {
        const geoLoc = await geocoder.geocode(req.body.updCampground.Location);
        if (!geoLoc) {
            req.body.updCampground.Lat = geoLoc[0].latitude;
            req.body.updCampground.Lng = geoLoc[0].longitude;
            req.body.updCampground.Location = geoLoc[0].formattedAddress;
        };

        let foundCampground = await vCampGround.findOneAndUpdate({_id: req.params.id}, {$set: req.body.updCampground}, {new: true, useFindAndModify: false});
        
        vMiddleware.CreateNotification(req.user._id, req.user.username, newlycreatedCampground.id, 2)

        req.flash("success", "Campground successfully modified");
        res.redirect("/campgrounds/" + req.params.id)        
    } catch (err) {
        req.flash("error", err.message);
        res.redirect('back');        
    };
});

// Destroy Campground Route
router.delete("/:id", vMiddleware.checkCampgroundOwnership, async function (req, res) {
    try {
        let foundCampground = await vCampGround.findOneAndDelete({_id: req.params.id});

        let founduser = await vUser.findById(req.user._id).populate('followers').exec();

        vMiddleware.CreateNotification(req.user._id, req.user.username, newlycreatedCampground.id, 3);

        req.flash("success", "Campground successfully deleted");
        res.redirect("/campgrounds") 
                
    } catch (error) {
        req.flash("error", "There was a problem accessing the data");
        res.redirect("/campgrounds");        
    }
    // res.send("You want to destroy a campground");
    // vCampGround.findOneAndDelete({_id: req.params.id}, function (err) {
    //     if (err) {
    //         req.flash("error", "There was a problem accessing the data");
    //         res.redirect("/campgrounds");
    //     } else {
    //         req.flash("success", "Campground successfully deleted");
    //         res.redirect("/campgrounds");
    //     };
    // });
});

// Campground Like Route
router.post("/:id/like", vMiddleware.IsLoggedIn, function (req, res) {
    vCampGround.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});


module.exports = router;

