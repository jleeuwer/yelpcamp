var     mongoose    = require("mongoose");
var     Campground  = require("./models/mcampground");
var     Comment     = require("./models/mcomment");
var     User        = require("./models/user");
const   fs          = require("fs"); 

var vCampgroundschema = new mongoose.Schema ({
    Name            :   String,
    Image           :   String,
    Description     :   String,
    Price           :   String,
    Location        :   String,
    Lat             :   Number,
    Lng             :   Number, 
    CreatedAt       :   { type: Date, default: Date.now },
    Author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ]
});

var commentSchema = new mongoose.Schema({
    Text: String,
    CreatedAt:   { type: Date, default: Date.now },
    Author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

// Two JSON arrays for reading the test data from file
var data = [{}];
var comData = [{}];

// Read all users into an Array
// Delete all campgrounds
// Delete all comments
// Voor alle campgrounds 
//     Voeg Random Comments toe aan campgrounds
//     Voor iedere campground bepaal een random gebruiker
//     Voor iedere Comment bepaal een random gebruiker
//   
// Random number : Math.floor(Math.random() * 10);
// Length of Array : array.length (is altijd 1 hoger dan de hoogste index in de array)


function seedDB(){

    // Process the JSON data for campground
    // Read users.json file 
    fs.readFile("campgroundtestdata.json", function(err, campgroundstestdata) { 
        
        // Check for errors 
        if (err) {
            throw err; 
        };
    
        // Converting to JSON 
        data = JSON.parse(campgroundstestdata); 
    }); 
    // Process the JSON data for comments
    fs.readFile("commenttestdata.json", function(err, commenttestdata) { 
        
        // Check for errors 
        if (err) {
            throw err; 
        };
    
        // Converting to JSON 
        comData = JSON.parse(commenttestdata); 
    }); 

    // Remove all campgrounds
    Campground.deleteMany({}, function(err){
        if(err){//
            console.log(err);
            return;
        } 
    });  // Campground deletemany
    console.log("removed campgrounds!");

    // Remove all comments
    Comment.deleteMany({}, function(err) {//
        if(err){
            console.log(err);
            return;
        }
    }); // Comment deletemany
    console.log("removed comments!");

    // Read all the users into an array
    User.find({}, function(err, allUsers) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
            return;
        } else 
        {
            comData.forEach( function(comseed) {
                if(err){
                    req.flash("error", "There was a problem accessing the data");
                    return;
                } else {
                    commentSchema.Text = comseed.Text;
                    commentSchema.CreatedAt = comseed.CreatedAt;
                    // Determine a random user
                    var vRandomUser = Math.floor(Math.random() * (allUsers.length-1));
                    // Connect user to comment
                    var vAuthor = {
                        id: allUsers[vRandomUser]._id,
                        username: allUsers[vRandomUser].username
                    };
                    commentSchema.Author = vAuthor;
                    Comment.create(commentSchema,
                        function(err, comment){
                            if (err){
                                console.log(err);
                                return
                            };
                            // Comment.save();
                        });
                    };
            });
        }
    });

    // Read all the users into an array
    User.find({}, function(err, allUsers) {
        if(err){
            req.flash("error", "There was a problem accessing the data");
            return;
        } else 
        {
            Comment.find({}, function (err, allComments) {
                if (err) {
                    req.flash("error", "There was a problem accessing the data");
                    return;                    
                } else {
                    console.log("Alle comments");
                    console.log(allComments);
                    console.log("Users " + allUsers);
                    //add a few campgrounds
                    data.forEach( function(seed) {
                        console.log("Create campground");
                        // Copy data
                        vCampgroundschema.Name          =  seed.Name;
                        vCampgroundschema.Image         =  seed.Image;
                        vCampgroundschema.Description   =  seed.Description;
                        vCampgroundschema.Price         =  seed.Price;
                        vCampgroundschema.Location      =  seed.Location;
                        vCampgroundschema.Lat           =  seed.Lat;
                        vCampgroundschema.Lng           =  seed.Lng;
                        vCampgroundschema.CreatedAt     =  seed.CreatedAt;
                        vCampgroundschema.comments      =  [];
        
                        // Determine a random user
                        var vRandomUser = Math.floor(Math.random() * (allUsers.length-1));
                        // Connect user to campground
                        // console.log("Selected user " + allUsers[vRandomUser]);
                        // console.log("Push user to campground");
                        var vAuthor = {
                            id: allUsers[vRandomUser]._id,
                            username: allUsers[vRandomUser].username
                        };
                        vCampgroundschema.Author = vAuthor
                        // console.log("Vcampgroundschema" + vCampgroundschema.Name);
                        // console.log("Author " + vAuthor);         
                        console.log("Campground " + vCampgroundschema);
                        // console.log("added a campground");
                        //create one or more comments comment
                        // Determine a randon number for adding comments
                        var vRandomComment = Math.floor(Math.random() * (allComments.length-1));
                        // Start a loop for adding comments
                        console.log(`Adding ${vRandomComment} comments to campground`);
                        var i = 1;
                        while (i <= vRandomComment) {
                            // Determine the comment to be attached
                            var vCommentnumber = Math.floor(Math.random() * (allComments.length-1));
                            // console.log("Create comment");
                            // Connect comment to the campground
                            // console.log("Attach comment to campground");
                            console.log("Comment " + allComments[vCommentnumber]);
                            vCampgroundschema.comments.push(allComments[vCommentnumber]._id);
                            i++;
                        };
                        Campground.create(vCampgroundschema, function(err, campground){
                            if(err){
                                console.log(err)
                            } else {
                            };
                            campground.save();
                        });
                    });
                };
            });
        };
    });
}

module.exports = seedDB;
