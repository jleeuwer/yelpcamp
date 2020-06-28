var     mongoose    = require("mongoose");
var     Campground  = require("./models/mcampground");
var     Comment     = require("./models/mcomment");
var     User        = require("./models/user");
const   fs          = require("fs"); 

var userChanges =  {
    notifications: [
        {
           type: vmongoose.Schema.Types.ObjectId,
           ref: 'Notification'
        }
    ],
    followers: [
        {
            type: vmongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
};


