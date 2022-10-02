// All the middleware will be programmed here

var vCampGround     = require("../models/mcampground");
var vComment        = require("../models/mcomment");
var Notification   = require("../models/mnotifications");
var vUser           = require("../models/user");

var mid_Object = {}

mid_Object.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        vCampGround.findById(req.params.id, function(err, foundCampground) {
            if(err){
                req.flash("error", "There was a problem accessing the data");
                res.redirect("back");
            } else {
                // console.log(foundCampground);
                if (foundCampground.Author.id.equals(req.user._id) || req.user.vIsAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to perform this action");
                    res.redirect("back");
                };
            };
        });
    } else {
        res.redirect("back");
    };
};

mid_Object.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        vComment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                req.flash("error", "There was a problem accessing the data");
                res.redirect("back");
            } else {
                // console.log(foundCampground);
                if (foundComment.Author.id.equals(req.user._id) || req.user.vIsAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to perform this action");
                    res.redirect("back");
                };
            };
        });
    } else {
        res.redirect("back");
    };
};

// To check if a user is loggedin
mid_Object.IsLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login first");
    res.redirect("/login");
};

mid_Object.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        vCampGround.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

mid_Object.checkFollowing = function (req, res, next) {
    if (req.isAuthenticated()) {
        vCampGround.findById(req.params.id).populate("followers").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.followers
                var foundUserFollowing = foundCampground.followers.some(function (follower) {
                    return follower.id.equals(req.user._id);
                });
                if (foundUserFollowing) {
                    req.flash("error", "You already following");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

mid_Object.escapeRegex = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

mid_Object.CreateNotification = async function(par_user_id, par_username, par_campgroundid, par_typeOfUpdate) {

    let founduser = await vUser.findById(par_user_id).populate('followers').exec();

    // create notifiation object
    let newNotification = {
        username: par_username,
        campgroundId: par_campgroundid,
        TypeOfUpdate: par_typeOfUpdate
    };

    // Create a notification for each follower
    for(const follower of founduser.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
    }
};

module.exports = mid_Object;
