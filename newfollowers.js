var Twitter = require('twitter');
var dotenv = require('dotenv');
var fs = require('fs');
dotenv.config();

var client = new Twitter({
    consumer_key: process.env.NEWFOLLOWER_CONSUMER_KEY,
    consumer_secret: process.env.NEWFOLLOWER_CONSUMER_SECRET,
    access_token_key: process.env.NEWFOLLOWER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.NEWFOLLOWER_ACCESS_TOKEN_SECRET
});
var newfollowers = new Array();
console.log("starting MENTION");
var filename="newfollowers.txt";

if (fs.existsSync(filename))
{
    newFollowers = fs.readFileSync(filename).toString().split("\n");
    filtered = newFollowers.filter(Boolean);
    newFollowers = filtered;
    processNewFollowers();
}
var timer = setInterval(processNewFollowers, 3600000);// 900000); // 1 hour

function processNewFollowers()
{
    if (fs.existsSync(filename))
    {
        console.log("File exists goint to process");
        newFollowers = fs.readFileSync(filename).toString().split("\n");
        PostAppreciation(filename);
        FollowBack(filename);
        fs.unlink(filename, function(err) {
            if (err) throw err;
            console.log("New Follower File deleted");
        });  
        newFollowers = new Array(); // make it empty
    }  
    else{
        console.log("File doesn't exist. Will check again in an hour");
    }
}
function PostAppreciation(filename)
    {
        console.log("starting to read file");
        for(var i=0;i<newFollowers.length;i++)
        {
            try{
                var id = newFollowers[i];
                if (id!=null&&id.length>0)
                {
                    console.log("PostAppreciate ID: " + id);
                    try{
                        client.get("users/lookup", {user_id:id}, function(error, user, response) {
                            if ("error") console.log(error);
                            var _user = user[0].screen_name;
                        
                            console.log(_user);
                        
                            try{
                                client.post('statuses/update', {status:"@"+_user + " Thanks for the follow. I followed back."}, function (error, tweet, response) {
                                    if (error) console.log("There was an error sending post " + error);
                                    console.log("Post sent to new follower @" + _user + " successfully");
                                });
                            }
                            catch(Err)
                            {
                                console.log("Error updating status for user " + _user);
                            }
                        });
                    }
                    catch(e)
                    {
                        console.log("Error processing new followers " + id);
                        // remove user from list
                        var index = newFollowers.indexOf(id);
                        newFollowers.Splice(index);
                    }
                }
            }
            catch(e)
            {
                console.log("Error ")
            }
        }
    }
    function FollowBack()
    {
        console.log("Starting followback");
        
        for(var i=0;i<newFollowers.length;i++)
        {
            try
                {
                var id = newFollowers[i];
                if (id!=null&&id.length>0)
                {
                    console.log("FOLLOWBACK ID: " + id);
                                
                    // follow back
                    client.post("friendships/create", {user_id:id, follow:true}, function(error, user, response) {
                        if (error) console.log(error);
                        console.log("Follow back successful " + user.screen_name);
                    });  
                }
            }
            catch(err)
            {
                console.log("Exception following user back " + user.screen_name);
            }      
        }
    }