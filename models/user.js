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

userSchema.pre("save", function(next) {
    var self = this;

    // Email address should be unique
    this.constructor.findOne({ 'vEmail' : self.vEmail }, 'vEmail', function(err, results) {
        if(err) {
            next(err);
        } else if(results) {
            // console.warn('results', results);
            self.invalidate("Email", "Email must be unique");
            next(err);
        } else {
            next();
        }
    });
    // Username must be unique
    this.constructor.findOne({ 'vUserName' : self.vUserName }, 'vUserName', function(err, results) {
        if(err) {
            next(err);
        } else if(results) {
            // console.warn('results', results);
            self.invalidate("Username", "Username must be unique");
            next(err);
        } else {
            next();
        }
    });
});

userSchema.plugin(vpassportlocalmongoose);
 
module.exports = vmongoose.model("User", userSchema);