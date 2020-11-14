var     mongoose        = require("mongoose");
var     Campground      = require("./models/mcampground");
var     Comment         = require("./models/mcomment");
var     User            = require("./models/user");
var     Notifications   = require("./models/mnotifications.js");
var     Review          = require("./models/mreviews");
const   fs              = require("fs"); 
const   userSeed        = require("./seedusers.js");
const   async          = require("async");


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
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
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

// Define a model for reviews
var reviewSchema = new mongoose.Schema({
    rating: {
        // Setting the field type
        type: Number,
        // Making the star rating required
        required: "Please provide a rating (1-5 stars).",
        // Defining min and max values
        min: 1,
        max: 5,
        // Adding validation to see if the entry is an integer
        validate: {
            // validator accepts a function definition which it uses for validation
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
    // review text
    text: {
        type: String
    },
    // author id and username fields
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // campground associated with the review
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground",
        index: true
    }
});

// Two JSON arrays for reading the test data from file
var data = [{}];
var comData = [{}];
var reviewData = [{}];
var campgroundReview = [{}];

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

async function ReadCampGroundTestData() {

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
};

async function ReadCommentTestData() {
    // Process the JSON data for comments
    fs.readFile("commenttestdata.json", function(err, commenttestdata) { 
        
        // Check for errors 
        if (err) {
            throw err; 
        };
    
        // Converting to JSON 
        comData = JSON.parse(commenttestdata); 
    }); 
};

async function ReadReviewTestData() {
    // Process the JSON data for comments
    fs.readFile("reviewtestdata.json", function(err, reviewtestdata) { 
        
        // Check for errors 
        if (err) {
            throw err; 
        };
    
        // Converting to JSON 
        reviewData = JSON.parse(reviewtestdata); 
    }); 
};

async function RemoveAllPreviousTestData() {
    try {
        // Remove all campgrounds
        await Campground.deleteMany({});  

        // Campground deletemany
        console.log("removed campgrounds!");
    
        // Remove all comments
        await Comment.deleteMany({});

        // Remove all notifications
        await Notifications.deleteMany({});

        await Review.deleteMany({});

        // Comment deletemany
        console.log("removed comments!");
    } catch {
        console.log("An error occurred removing all previous test data");
    };
};

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

async function seedDB(){
    // try {
        async.waterfall(
            [
                function(cb) {
                    console.log("Call userseed");
                    userSeed();
                    cb;
                }
            ],
            async function (err,values) {          //The "done" callback that is ran after the functions in the array have completed
                if (err) {                    //If any errors occurred when functions in the array executed, they will be sent as the err.
                    console.error(err);
                } else {                      //If err is falsy then everything is good
                    // Read all the users into an array
                    let allUsers = await User.find({});
                    // End the procedure if no users are found
                    console.log (allUsers);
            
                    if (allUsers.length === 0) {
                        console.log("No users found");
                        return;
                    };
                    // Read the data for campgrounds
                    ReadCampGroundTestData();
                    if (process.env.DEBUG==="1") {
                        console.log("Alle campgrounds");
                        console.log(data);
                    };
                
                    ReadCommentTestData();
            
                    ReadReviewTestData();   
                
                    RemoveAllPreviousTestData()
                    
                    // Write Test Comments
                    for (const comseed of comData) {
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
                        let comment = await Comment.create(commentSchema);
                    };
            
                    // Read the comments
                    let allComments = await Comment.find({});
                    if (process.env.DEBUG==="1") {
                        console.log("Alle comments");
                        console.log(allComments);
                        console.log("Users " + allUsers);
                    };
            
                    if (process.env.DEBUG==="1") {
                        console.log("Alle reviews");
                        console.log(reviewData);
                    };
                    
                    //add a few campgrounds
                    for (const seed of data) {
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
                        vCampgroundschema.likes         =  [];
                        // vCampgroundschema.rating        = Math.floor(Math.random() * 5);
                        vCampgroundschema.rating        = 0;
                
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
                        if (process.env.DEBUG==="1") {
                            console.log("Campground " + vCampgroundschema); 
                        };
                        // console.log("added a campground");
                        //create one or more comments comment
                        // Determine a randon number for adding comments
                        var vRandomComment = Math.floor(Math.random() * (allComments.length-1));
                        // Start a loop for adding comments
                        if (process.env.DEBUG==="1") {
                            console.log(`Adding ${vRandomComment} comments to campground`);
                        };
                        var i = 1;
                        while (i <= vRandomComment) {
                            // Determine the comment to be attached
                            var vCommentnumber = Math.floor(Math.random() * (allComments.length-1));
                            // console.log("Create comment");
                            // Connect comment to the campground
                            // console.log("Attach comment to campground");
                            if (process.env.DEBUG==="1") {
                                console.log("Comment " + allComments[vCommentnumber]);
                            };
                            vCampgroundschema.comments.push(allComments[vCommentnumber]._id);
                            i++;
                        };
                        let campground = await Campground.create(vCampgroundschema);
            
                        // I want to randomly determine if I need to add 1 or more reviews
                        // For test purposes I also need campgrounds without review
                        if (random_boolean = Math.random() >= 0.6) {
                            // Now generatie reviews for all campgrounds
                            // Store all the campground._id in an array of reviews
                            // Read the review test data file
                            // Loop through the campgrounds and one or more reviews to the review schema
                            let temp_campgroundid = campground._id;
                            // Create max 3 reviews
            
                            // If you want to generate a random number between 1 and 5 always add 1
                            for (let i = 0; i <= (Math.floor(Math.random() * 5) + 1); i++) {
                                reviewSchema.rating     = Math.floor(Math.random() * 5) + 1;
                                reviewSchema.text       = reviewData[Math.floor(Math.random() * (reviewData.length-1))].text;
                                reviewSchema.campground = temp_campgroundid;
                                // Determine a random user
                                var vRandomUser = Math.floor(Math.random() * (allUsers.length-1));
                                var vAuthor = {
                                    id: allUsers[vRandomUser]._id,
                                    username: allUsers[vRandomUser].username
                                };
                                reviewSchema.author = vAuthor;
                                if (process.env.DEBUG==="1") {
                                    console.log(reviewSchema.rating);
                                    console.log(reviewSchema.text);
                                    console.log(reviewSchema.campground);
                                    console.log(reviewSchema.Author);
                                }
                                let review = await Review.create(reviewSchema);  
                                campground.reviews.push(review);
                                // calculate the new average review for the campground
                                campground.rating = calculateAverage(campground.reviews);
                            };
                            //save campground
                            campground.save();
                        };
            
                    };
            
                    // Create some followers for each user
                    // Loop through the users
                    // Create a random set of followers
                    // allUsers.forEach(upd(err, user) {
                    //     // handle
                    //     console.log(foundUser.vUserName);
                    // });
                    // Generate followers
                    for (const user of allUsers) {
                        if (process.env.DEBUG===1) {
                            console.log(user);
                        };
                        // Generate two followers
                        // Remove all existing followers
                        let remuser = await User.updateOne({ _id: user._id}, { $set: { followers: [] }});
                        for (i = 0; i<2; i++) {
                            // Determine a random user
                            // Check of ID already exists in followers
                            // Check of follower not the same is as the id being processed
                            let controlCheck = false;
                            while (!controlCheck) {
                                var vRandomUser = Math.floor(Math.random() * (allUsers.length-1));
            
                                if (process.env.DEBUG===1) {
                                    console.log("Random bepaalde follower" + allUsers[vRandomUser]._id);
                                    console.log("Verwerkte gebruiker" + user._id);
                                };
                                // User may not follow himself
                                if (allUsers[vRandomUser]._id != user._id) {
                                    var follower = {
                                        followers: allUsers[vRandomUser]._id
                                    };
                                    // console.log(allUsers[vRandomUser]);
                                    // User may not follow twice
                                    if (user.followers.indexOf(allUsers[vRandomUser]._id) === -1) {
                                            if (process.env.DEBUG===1) {
                                                console.log("Pushing");
                                            }
                                            user.followers.push(allUsers[vRandomUser]._id);
                                            controlCheck = true;
                                    };
                                };
                            };
                        };
                        user.save();
                        // Notifications
                        remuser = await User.updateOne({_id: user._id}, { $set: { notifications: [] }});
            
                    };
    
                };
            }
        );
        console.log("Kom ik hier?");
    // } catch (err) {
    //     console.log("An error occurred creating all previous test data " + err.message);
    // };
}

module.exports = seedDB;
