const vmongoose = require("mongoose");

// Schema Setup
 
var commentSchema = new vmongoose.Schema({
    Text: String,
    Author: {
        id: {
            type: vmongoose.Schema.Types.Objectid,
            ref: "User"
        },
        username: String
    }
});
 
module.exports = vmongoose.model("Comment", commentSchema);