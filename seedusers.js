var     User            = require("./models/user");
const   fs              = require("fs"); 
var     express         = require("express");
const   async          = require("async");

var userData = [{}];

function ReadUserTestData() {
    // Process the JSON data for users
    // Read users.json file 
    console.log("Reading user testdata");
    userTestData = fs.readFileSync ("users.json");
    // Converting to JSON 
    userdata = JSON.parse(userTestData); 
    if (process.env.DEBUG === 1) {
        console.log (userdata);
    };
    return userdata;
};

function userSeed () {
    // async.waterfall (
    //     [
    //     async function(callback) {
    //         // Remove all Users
    //         console.log("Remove all users");
    //         let user = await User.deleteMany({});
    //         return "Users Removed";
    //     },
    //     async function(result1, callback) {
    //         // Read the testdata
    //         console.log(result1);
    //         userData = ReadUserTestData();

    //         // Write Test Comments
    //         for (const user of userData) {
    //             // if (process.env.debug === 1 ) {
    //                 console.log("Processing " + user.username);
    //             // };
    //             var vuser                   = new User();
    //             vuser.username              = user.username;
    //             vuser.vFirstname            = user.vFirstname;
    //             vuser.vUserName             = user.vUserName;
    //             vuser.vLastname             = user.vLastname;
    //             vuser.vDateBirth            = user.vDateBirth;
    //             vuser.vFacebook             = user.vFacebook;
    //             vuser.vTwitter              = user.vTwitter;
    //             vuser.vAvatar               = user.vAvatar;
    //             vuser.resetPasswordToken    = "";
    //             vuser.resetPasswordExpires  = "";
    //             vuser.vEmail                = user.vEmail;
    //             vuser.vPassword             = user.vPassword;
    //             vuser.vIsAdmin              = user.vIsAdmin;
    //             vuser.notifications         = [];
    //             vuser.followers             = [];

    //             console.log("Here");
    //             let cuser = await User.register(vuser, vuser.vPassword);

    //             // User.register(vuser, vuser.vPassword, function(err, user) {
    //             //     if(err){
    //             //         console.log(err);
    //             //         return res.render("register", {error: err.message});
    //             //     }
    //             // });
    //         };
    //         return "Users Created";
    //         }
    //     ],
    //     function(err, results) {
    //         if (err) {
    //             console.log(err.message);
    //         } else {
    //             console.log(results);
    //         };
    //     }
    // );

    // Remove all Users
    console.log("Remove all users");
    User.deleteMany({}, async function (err, user ) {
        if (err) {
            console.log("Error " + err.message);
        } else {
            // Read the testdata
            let userData = await ReadUserTestData();
            // Write Test Comments
            for (const user of userData) {
                console.log("Reading user " + user.username);
                var vuser                   = new User();
                vuser.username              = user.username;
                vuser.vFirstname            = user.vFirstname;
                vuser.vUserName             = user.vUserName;
                vuser.vLastname             = user.vLastname;
                vuser.vDateBirth            = user.vDateBirth;
                vuser.vFacebook             = user.vFacebook;
                vuser.vTwitter              = user.vTwitter;
                vuser.vAvatar               = user.vAvatar;
                vuser.resetPasswordToken    = "";
                vuser.resetPasswordExpires  = "";
                vuser.vEmail                = user.vEmail;
                vuser.vPassword             = user.vPassword;
                vuser.vIsAdmin              = user.vIsAdmin;
                vuser.notifications         = [];
                vuser.followers             = [];
            
                User.register(vuser, vuser.vPassword, function(err, user) {
                    if(err){
                        console.log(err);
                        return;
                    }
                });
            };
        };
    });

};

module.exports = userSeed;