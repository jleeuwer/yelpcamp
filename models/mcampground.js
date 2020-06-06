const vmongoose = require("mongoose");

// Schema Setup

var vCampgroundschema = new vmongoose.Schema ({
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
