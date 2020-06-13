// All the middleware will be programmed here

var vCampGround = require("../models/mcampground");
var vComment = require("../models/mcomment");

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

module.exports = mid_Object;
