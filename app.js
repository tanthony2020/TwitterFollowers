var Twitter = require('twitter');
var dotenv = require('dotenv');
var fs = require('fs');
dotenv.config();

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

console.log("starting robot");
function WriteToFile(filename, text)
{
    try {
        fd = fs.openSync(filename, 'a');
        fs.appendFileSync(fd, text, 'utf8');
      } catch (err) {
        /* Handle the error */
      } finally {
        if (fd !== undefined)
          fs.closeSync(fd);
      }
}

console.log("calling follows");
var followerList = new Array();
var firstTime = true;
getFollowers(); // run the first time
var timer = setInterval(getFollowers, 3600000); // 1 hour

//getFollowers();
function getFollowers() {
    client.get("followers/ids", { stringify_ids: true }, function(error, ids, response) {
        //console.log(ids.ids);
        if (firstTime) {
            followerList=ids.ids;
        } else {
            // check to see if you have lost any followers
            for (var j = 0; j < followerList.length; j++) {
                var id = followerList[j];
                
                var found = ids.ids.includes(id);
                
                if (!found) {
                    WriteToFile('unfollowers.txt', id+"\r\n");
                    // you lost a follower
                    console.log("You lost a follower " + id);
                    // remove from list
                    var index = followerList.indexOf(id);
                    followerList.splice(index);
                }
            }
            // check for new followers
            for (var i = 0; i < ids.ids.length; i++) {
                var id = ids.ids[i];
                // not first time run, we want to check for new followers and 
                // send them a welcome tweet
                if (!followerList.includes(id)) {
                    // get user info by id
                    try
                    {
                        // add to text file
                        WriteToFile("newfollowers.txt", id+"\r\n");                         
                    }
                    catch (err) {
                    /* Handle the error */
                        console.log(err);
                    } finally {
                    // something here
                    }
                    // add it to the list now
                    followerList.push(ids.ids[i]);
                }
            }
        }
        firstTime = false; // it's not the first time anymore
    });
}
function NewFollowerWelcome(id) {
    try{
        client.get("users/lookup", {user_id:id}, function(error, user, response) {
            if (error) console.log(error);
            var _user = user[0].screen_name;
        
            console.log("Sending new user Tweet @" + _user);
        
            client.post('statuses/update', {status:"@"+_user + " Thanks for the follow."}, function (error, tweet, response) {
                if (error) console.log("There was an error sending post");
                console.log("Post sent successfully");
            });    
        });
    }
    catch(e)
    {
        console.log(e);
    }
}
