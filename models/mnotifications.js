var vmongoose = require("mongoose");

var vnotificationSchema = new vmongoose.Schema ({
	username: String,
	campgroundId: String,
	TypeOfUpdate: Number,
	// 1 = Create campgrounnd
	// 2 = Update campgrounnd
	// 3 = delete campground
	// 4 = create comment campground
	// 5 = update comment campground
	// 6 = delete comment campground
	isRead: { type: Boolean, default: false }
});

module.exports = vmongoose.model("Notifications", vnotificationSchema);