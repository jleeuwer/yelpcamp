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
    slug: {
        type: String,
        unique: true
    },
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

// add a slug before the campground gets saved to the database
vCampgroundschema.pre('save', async function (next) {
    try {
        // check if a new campground is being saved, or if the campground name is being modified
        if (this.isNew || this.isModified("Name")) {
            this.slug = await generateUniqueSlug(this._id, this.Name);
        }
        next();
    } catch (err) {
        next(err);
    }
});

var Campground = vmongoose.model("Campground", vCampgroundschema);

module.exports = Campground;

async function generateUniqueSlug(id, campgroundName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = await slugify(campgroundName);
        }
        // check if a campground with the slug already exists
        var campground = await Campground.findOne({slug: slug});
        // check if a campground was found or if the found campground is the current campground
        if (!campground || campground._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        var newSlug = slugify(campgroundName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, campgroundName, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

async function slugify(text) {
    var slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + (Math.floor(1000 + Math.random() * 10000)).toString();  // Add 5 random digits to improve uniqueness
}
