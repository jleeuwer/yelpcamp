const vmongoose = require("mongoose");

// Schema Setup
 
var commentSchema = new vmongoose.Schema({
    Text: String,
    CreatedAt:   { type: Date, default: Date.now },
    Author: {
        id: {
            type: vmongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});
 
module.exports = vmongoose.model("Comment", commentSchema);