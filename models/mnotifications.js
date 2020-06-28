var vmongoose = require("mongoose");

var vnotificationSchema = new vmongoose.Schema ({
	username: String,
	campgroundId: String,
	isRead: { type: Boolean, default: false }
});

module.exports = vmongoose.model("Notifications", vnotificationSchema);