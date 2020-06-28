const vmongoose = require("mongoose");
const vpassportlocalmongoose = require("passport-local-mongoose");

// Schema Setup
 
var userSchema = new vmongoose.Schema({
    vUserName: String,
    vPassword: String,
    vFirstname: String,
    vLastname: String,
    vAvatar: String,
    vFacebook: String,
    vTwitter: String,
    vDateBirth: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    vEmail: {type: String, unique: true, required: true},
    vIsAdmin: {type: Boolean, default: false},
    notifications: [
    	{
    	   type: vmongoose.Schema.Types.ObjectId,
    	   ref: 'Notifications'
    	}
    ],
    followers: [
    	{
    		type: vmongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
});

userSchema.plugin(vpassportlocalmongoose);
 
module.exports = vmongoose.model("User", userSchema);