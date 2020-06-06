const vmongoose = require("mongoose");

// Schema Setup

var vCampgroundschema = new vmongoose.Schema ({
    Name            :   String,
    Image           :   String,
    Description     :   String,
    Price           :   String,
    location        :   String,
    Lat             :   Number,
    Lng             :   Number, 
    Author: {
        id: {
            type: vmongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
           type: vmongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
    ]
});

module.exports = vmongoose.model("Campground", vCampgroundschema);

var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   location: String,
   lat: Number,
   lng: Number,
   author: {
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

module.exports = mongoose.model("Campground", campgroundSchema);