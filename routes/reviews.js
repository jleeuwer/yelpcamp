var express = require("express");
var router = express.Router({mergeParams: true});
var vMiddleware = require("../middleware"); // If requiring a directory, it will require the index.js in that directory

var Notification    = require("../models/mnotifications.js");
var vUser           = require("../models/user.js");
var vCampGround     = require("../models/mcampground");
var vReviews        = require("../models/mreviews");
var vComment        = require("../models/mcomment");

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

// Index Route - show all data
router.get("/", function(req, res){

});

// New route - Show form to add review
router.get("/new", vMiddleware.IsLoggedIn , vMiddleware.checkReviewExistence, function(req, res){
    vCampGround.findById(req.params.id).populate("comments likes").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            //render show template with that campground
            res.render("reviews/new.ejs", {campground: foundCampground} );
        }
    });
});

// Create Route - add review to the DB
router.post("/", vMiddleware.IsLoggedIn , async function(req, res){
    //lookup campground using ID
    vCampGround.findById(req.params.id).populate("reviews").exec(function (err, campground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        vReviews.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated campground to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.campground = campground;
            //save review
            review.save();
            campground.reviews.push(review);
            // calculate the new average review for the campground
            campground.rating = calculateAverage(campground.reviews);
            //save campground
            campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });

    let founduser = await vUser.findById(req.user._id).populate('followers').exec();
    // create notifiation object
    let newNotification = {
        username: req.user.username,
        campgroundId: req.params.id,
        TypeOfUpdate: 7
    };
    // Create a notification for each follower
    for(const follower of founduser.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
    }
    founduser.save();
});

// Show Route - Show data of one instance from the dataset
router.get("/:review_id", vMiddleware.IsLoggedIn , function (req, res) {

});

// Edit Review Route
router.get("/:review_id/edit", vMiddleware.checkCampgroundOwnership, function(req, res) {
    vCampGround.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            vReviews.findById(req.params.review_id, function (err, foundReview) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                res.render("reviews/edit", {campground_id: req.params.id, campground: foundCampground, review: foundReview});
            });
        };
    });
});

// Update Review Route
router.put("/:review_id", async function (req, res) {
    try {
        vReviews.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            vCampGround.findById(req.params.id).populate("reviews").exec(function (err, campground) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                // recalculate campground average
                campground.rating = calculateAverage(campground.reviews);
                //save changes
                campground.save();
                req.flash("success", "Your review was successfully edited.");
                res.redirect('/campgrounds/' + campground._id);
            });
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect('back');        
    };
});

// Delete Review Route
router.delete("/:review_id", vMiddleware.checkCampgroundOwnership, async function (req, res) {
    try {
        vReviews.findByIdAndRemove(req.params.review_id, function (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            vCampGround.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, campground) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                // recalculate campground average
                campground.rating = calculateAverage(campground.reviews);
                //save changes
                campground.save();
                req.flash("success", "Your review was deleted successfully.");
                res.redirect("/campgrounds/" + req.params.id);
            });
        });                
    } catch (error) {
        req.flash("error", "There was a problem accessing the data");
        res.redirect("/campgrounds");        
    }
});



module.exports = router;

