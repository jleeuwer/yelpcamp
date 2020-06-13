const vmongoose = require("mongoose");
const vpassportlocalmongoose = require("passport-local-mongoose");

// Schema Setup
 
var userSchema = new vmongoose.Schema({
    vUserName: String,
    vPassword: String,
    vIsAdmin: {type: Boolean, default: false}
});

userSchema.plugin(vpassportlocalmongoose);
 
module.exports = vmongoose.model("User", userSchema);