
// Module setup
var express = require("express");
var router = express.Router({mergeParams: true});
var vCampGround = require("../models/mcampground");
var vComment = require("../models/mcomment");
var vMiddleware = require("../middleware"); // If requiring a directory, it will require the index.js in that directory


// Comments Route

// Create Comment Route 
router.get("/new", vMiddleware.IsLoggedIn ,function (req, res) {
    vCampGround.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err){
            // console.log("There is an error");
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            // console.log(foundCampground);
            res.render("comments/new", {campground: foundCampground});
        };
    });
});

// Create Route - add campground to the DB
router.post("/", vMiddleware.IsLoggedIn, function(req, res){
    vCampGround.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err){
            // console.log("There is an error");
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            // console.log("Saving comment");
            vComment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "There was a problem accessing the data");
                    // console.log("There is an error");
                    res.redirect("/campgrounds");
                } else {
                    // Find the user id and username
                    // console.log(req.user.username);
                    comment.Author.id = req.user.id;
                    comment.Author.username = req.user.username;
                    comment.save();
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success", "Comment successfully added");
                    res.redirect('/campgrounds/' + foundCampground._id);
                };
            });
        };
    });
});

// Edit Routes

router.get("/:comment_id/edit", vMiddleware.checkCommentOwnership, function(req, res){
    // res.send("You want to edit a comment");
    vComment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            req.flash("error", "There was a problem accessing the data");
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        };
    })
});

// Comment updates routes

router.put("/:comment_id", vMiddleware.checkCommentOwnership , function (req, res) {
    // res.send("You have hit the update route");
    vComment.findOneAndUpdate({_id: req.params.comment_id}, {$set: req.body.updComment}, {new: true, useFindAndModify: false}, function (err, vComment) {
        if (err) {
            req.flash("error", "There was a problem accessing the data");
            res.redirect("back");
        } else {
            req.flash("success", "Comment successfully modified");
            res.redirect("/campgrounds/" + req.params.id);
        };
    });
});

// Destroy Route

router.delete("/:comment_id", vMiddleware.checkCommentOwnership, function(req, res) {
    // res.send("Destroy comment route");
    vComment.findOneAndDelete({_id: req.params.comment_id}, function (err) {
        if (err) {
            req.flash("error", "There was a problem accessing the data");
            res.redirect("back");
        } else {
            req.flash("success", "Comment successfully deleted");
            res.redirect("/campgrounds/" + req.params.id);
        };
    });
});

module.exports = router;
