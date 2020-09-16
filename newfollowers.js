var Twitter = require('twitter');
var dotenv = require('dotenv');
var fs = require('fs');
var readline = require('readline');
dotenv.config();

var client = new Twitter({
    consumer_key: process.env.NEWFOLLOWER_CONSUMER_KEY,
    consumer_secret: process.env.NEWFOLLOWER_CONSUMER_SECRET,
    access_token_key: process.env.NEWFOLLOWER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.NEWFOLLOWER_ACCESS_TOKEN_SECRET
});

console.log("starting MENTION");
var filename="newfollowers.txt";
if (fs.existsSync(filename))
{
    processNewFollowers();
}
var timer = setInterval(processNewFollowers, 3600000);// 900000); // 1 hour

function processNewFollowers()
{
    if (fs.existsSync(filename))
    {
        console.log("File exists goint to process");
        ReadFile(filename);

        fs.unlink(filename, function(err) {
            if (err) throw err;
            console.log("New Follower File deleted");
        });  
    }  
    else{
        console.log("File doesn't exist. Will check again in an hour");
    }
}
function ReadFile(filename)
    {
        console.log("starting to read file");
        try {
            var rd = readline.createInterface({
                input: fs.createReadStream(filename),
                output: process.stdout,
                console: false
            });
            rd.on('line', function(line) {
                console.log(line);
                // get screen_name
                client.get("users/lookup", {user_id:line}, function(error, user, response) {
                    if (error) console.log(error);
                    var _user = user[0].screen_name;
                
                    console.log(_user);
                
                    client.post('statuses/update', {status:"@"+_user + " Thanks for the follow."}, function (error, tweet, response) {
                        if (error) console.log("There was an error sending post " + error);
                        console.log("Post sent to new follower @" + _user + " successfully");
                    });
                
                });
            });
     
          } catch (err) {
            /* Handle the error */
          } finally {
            
          }
    }