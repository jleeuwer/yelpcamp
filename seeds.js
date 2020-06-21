var     mongoose    = require("mongoose");
var     Campground  = require("./models/mcampground");
var     Comment     = require("./models/mcomment");
var     User        = require("./models/user");
const   fs          = require("fs"); 
var     Lipsum      = require('node-lipsum');


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


async function getLipsum() {
    try {
        var lipsum = await new Lipsum();
        var lipsumOpts = {
            start: 'yes',
            what: 'bytes',
            amount: 10
        };
        lipsum.getText(function(text) {
            console.log(text);
        }, lipsumOpts);
    } catch {
        console.log("Error. Lorem Ipsum not working");
    };
};

function ReadCampGroundTestData() {

    // Process the JSON data for campground
    // Read users.json file 
    fs.readFile("campgroundtestdata.json", function(err, campgroundstestdata) { 
        
        // Check for errors 
        if (err) {
            throw err; 
        };
    
        // Converting to JSON 
        return data = JSON.parse(campgroundstestdata); 
    }); 
};

function ReadCommentTestData() {
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

async function RemoveAllPreviousTestData() {
    try {
        // Remove all campgrounds
        await Campground.deleteMany({});  
        // Campground deletemany
        console.log("removed campgrounds!");
    
        // Remove all comments
        await Comment.deleteMany({}); 
        // Comment deletemany
        console.log("removed comments!");
    } catch {
        console.log("An error occurred removing all previous test data");
    };
};

async function seedDB(){
    try {
        // Get lipsum
        // getLipsum();

        // Read the data for campgrounds
        data = ReadCampGroundTestData();
    
        comData = ReadCommentTestData();
    
        RemoveAllPreviousTestData()
    
        // Read all the users into an array
        let allUsers = await User.find({});
    
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
        };
    } catch {
        console.log("An error occurred creating all previous test data");
    };
}

module.exports = seedDB;
