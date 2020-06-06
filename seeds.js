var mongoose = require("mongoose");
var Campground = require("./models/mcampground");
var Comment   = require("./models/mcomment");
 
var data = [
    {  
    Name  :"Salmon Creek",
    Image :"https://images.unsplash.com/photo-1533873984035-25970ab07461?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2853&q=80",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {  
    Name:"Jan's Tent",
    Image:"https://images.unsplash.com/photo-1455763916899-e8b50eca9967?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
    description: "Nachts zet ik altijd een tent op"
    },
    {  
    Name:"Linda Cave",
    Image:"https://images.unsplash.com/photo-1520824071669-892f70d8a23d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2497&q=80",
    description: "Ik zit graag in Linda's cave"
    },
    {  
    Name:"Roy's retreat",
    Image:"https://images.unsplash.com/photo-1537532244339-0a3e63bb818b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2851&q=80",
    description: "Roy's plekje"
    },
    {  
    Name:"Jan's Hangout",
    Image:"https://images.unsplash.com/photo-1502814828814-f57efb0dc974?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60",
    Description:"The place to relax with your friends",
    },
    {  
    Name:"Nick's Spot",
    Image:"https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80",
    Description:"This is where Nick hang's out",
    }
]
 
function seedDB(){
   //Remove all campgrounds
   Campground.deleteMany({}, function(err){
        if(err){//
            console.log(err);
        }
        console.log("removed campgrounds!");
        Comment.deleteMany({}, function(err) {//
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
             //add a few campgrounds
            data.forEach(function(seed){
                Campground.create(seed, function(err, campground){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added a campground");
                        //create a comment
                        Comment.create(
                            {
                                Text: "This place is great, but I wish there was internet",
                                Author: "Homer"
                           }, function(err, comment){
                               if(err){
                                   console.log(err);
                                } else {
                                    campground.comments.push(comment);
                                   campground.save();
                                    console.log("Created new comment");
                               }
                            });
                    }
                });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;
