const vmongoose = require("mongoose");

// Schema Setup

var vCampgroundschema = new vmongoose.Schema ({
    Name            :   { type: String, required: true},
    Image           :   String,
    Description     :   String,
    Price           :   String,
    Location        :   String,
    Lat             :   Number,
    Lng             :   Number, 
    CreatedAt       :   { type: Date, default: Date.now },
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
    ],
    likes: [
        {
            type: vmongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    reviews: [
        {
            type: vmongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

var Campground = vmongoose.model("Campground", vCampgroundschema);

module.exports = Campground;
