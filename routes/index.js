var     express = require("express");
var     router = express.Router({mergeParams: true});
var     vpassport = require("passport");
var     vUser = require("../models/user.js");
var     vCampground = require("../models/mcampground.js");
const   vasync = require("async");
const   vmailer = require("nodemailer");
const   vcrypto = require("crypto");
const   { IsLoggedIn } = require("../middleware/index.js");
const   user = require("../models/user.js");
const   notifications = require("../models/mnotifications.js");
const { readdirSync } = require("fs");

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
    var vuser = new vUser();
    vuser.username = req.body.username;
    vuser.vFirstname = req.body.firstname;
    vuser.vUserName = req.body.username;
    vuser.vLastname = req.body.lastname;
    vuser.vDateBirth = req.body.datebirth;
    vuser.vFacebook = req.body.facebook;
    vuser.vTwitter = req.body.twitter;
    vuser.vAvatar = req.body.avatar;
    vuser.resetPasswordToken = "";
    vuser.resetPasswordExpires = "";
    vuser.vEmail = req.body.email;
    vuser.vPassword = req.body.password;

    var vPassword = req.body.password;
    var vadminCode = req.body.admincode;
    if (vadminCode === 'YelpCamp') {
        vuser.vIsAdmin = true;
    };
    vUser.register(vuser, vPassword, function(err, user) {
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        vpassport.authenticate("local")(req, res, function() {
            req.flash("succes", "Welcome to yelpcamp" + user.vUsername);
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

// User profile route
router.get("/users/:id", async function (req, res) {
    var username = [];
    try {
        // Find the selected user and it's followers
        let vuser = await vUser.findById(req.params.id).populate('followers').exec();
        // Loop through each follower to get the username
        vuser.followers.forEach(async follower => {
            // console.log("Volger " + follower._id);
            let tuser = await vUser.findById(follower._id);
            // console.log("Username" + tuser.vUserName);
            username.push(tuser.vUserName);
            // console.log(follower);
            // console.log(username);
        });
        let foundCampgrounds = await vCampground.find().where('Author.id').equals(vuser._id).exec();
        res.render("users/show", {user: vuser, campgrounds: foundCampgrounds, username: username});
        }
    catch (err) {
        req.flash("error", "Something went wrong in accessing the data");
        res.redirect("/");
    };
});

// Saving the following action
router.get("/follow/:id", IsLoggedIn, async function (req, res ) {
    try {
        let vuser = await vUser.findById(req.params.id).populate('followers').exec();
        vuser.followers.push(req.user._id);
        vuser.save();
        req.flash("success", "Succesfully followd " + vuser.vUserName + '!');
        res.redirect("/users/" + req.params.id);
        }
    catch (err) {
            req.flash("error", "Something went wrong in accessing the data");
            res.redirect("/");
        };
});

// Show notifications page
router.get("/notifications", IsLoggedIn, async function (req, res ) {
    try {
        let founduser = await vUser.findById(req.user._id).populate( {
            path: 'notifications',
            options: { sort: { "_id" : -1 } }
        }).exec();
        let allNotifications = founduser.notifications;
        res.render("users/notification.ejs", {par_allNotifications : allNotifications} ); 
    }
    catch (err) {
            req.flash("error", "Something went wrong in accessing the data " + err.message);
            res.redirect("/");
    };
});   

// Show notification
router.get("/notifications/:id", IsLoggedIn, async function (req, res ) {
    try {
        let notification = await notifications.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`); // Use single quote to translate the $-expression
    }
    catch (err) {
            req.flash("error", "Something went wrong in accessing the data" + err.message);
            res.redirect("/");
    };
});   


function convertToYYYYMMDD(d) {
    date = new Date(d);
    year = date.getFullYear();
    month = date.getMonth()+1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    return (year+'-' + month + '-'+dt);
}

// Edit Campground Route
router.get("/users/:id/edit", function(req, res) {
    vUser.findById(req.params.id, function(err, foundUser) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
            res.redirect("/campgrounds");
        } else {
            var dateString = convertToYYYYMMDD(foundUser.vDateBirth);
            res.render("users/edit", {user: foundUser, inpDate: dateString});
        };
    });
});

// Forgot route
router.get("/forget", function(req, res) {
    res.render("forget");
});

// Forgot Post

router.post("/forgot", function(req, res, next) {
    vasync.waterfall([
      function(done) {
        vcrypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        vUser.findOne({ vEmail: req.body.email }, function(err, FoundUser) {
          if (!FoundUser) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }
  
          FoundUser.resetPasswordToken = token;
          FoundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          FoundUser.save(function(err) {
            done(err, token, FoundUser);
          });
        });
      },
      function(token, vUser, done) {
        // var smtpTransport = vmailer.createTransport("SMTP", {
        //   service: "Gmail",
        //   auth: {
        //     user: "wxgclan@gmail.com",
        //     pass: process.env.GMAILPW
        //   }
        // });
        // // create reusable transporter object using the default SMTP transport
        var smtpTransport = vmailer.createTransport('smtps://wxgclan%40gmail.com:'+process.env.GMAILPW+'@smtp.gmail.com');
        var mailOptions = {
          to: vUser.vEmail,
          from: "wxgclan@gmail.com",
          subject: "Node.js Password Reset",
          text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" + req.headers.host + "/reset/" + token + "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n"
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash("success", "An e-mail has been sent to " + vUser.vEmail + " with further instructions.");
          done(err, "done");
        });
      }
    ], function(err) {
      if (err) {
          return next(err);
      }
      res.redirect("/forget");
    });
  });

// Update Campground Route
router.put("/users/:id", function (req, res) {
    // console.log("Saving");
    // console.log(req.body.updUser);
    // findByIdAndUpdate has been depracated, so added new function
    // vCampGround.findByIdAndUpdate(req.params.id, req.body.updCampground, function (err, vCampGround) {
        
    vUser.findOneAndUpdate({_id: req.params.id}, {$set: req.body.updUser}, {new: true, useFindAndModify: false}, function (err, vuser) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // console.log("Bewaard is");
            // console.log(vuser);
            req.flash("success", "User successfully modified");
            res.redirect("/campgrounds")
        };
    });
});

// Reset Password Route, gotten via email
router.get("/reset/:token", function (req, res) {
    vUser.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
        if (!user) {
            req.flash("error", "Password token is invalid or has expired");
            return res.redirect("/forgot");
        };
        res.render("reset", {token: req.params.token});
    });
});

// Router to change the password
// Via reset.ejs
router.post("/reset/:token", function (req, res) {
    vasync.waterfall([
        function(done) {
            vUser.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user) {
                if (!user) {
                    req.flash("error", "Password token is invalid or has expired");
                    return res.redirect("/forgot");
                };
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.login(user, function(err) {
                                done(err, user);
                            });
                        });
                    }); 
                } else {
                    req.flash("error", "Passwords do not match!");
                    return res.redirect("back");
                };
            });
        },
        // Mail bevestiging
        function(vUser, done) {
            // create reusable transporter object using the default SMTP transport
            var smtpTransport = vmailer.createTransport('smtps://wxgclan%40gmail.com:'+process.env.GMAILPW+'@smtp.gmail.com');
            var mailOptions = {
              to: vUser.vEmail,
              from: "wxgclan@gmail.com",
              subject: "Password successfully changed",
              text: "Greetings \n\n" +
                "This is a confirmation that your password for "+ vUser.vEmail + "has been changed. \n\n"
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              req.flash("success", "Your password has been changed");
              done(err, "done");
            });
          }
    ], function(err) {
        res.redirect("/campgrounds");
    });

});



module.exports = router;
