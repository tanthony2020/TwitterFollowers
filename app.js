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
var currentFollowersFilename="currentfollowers.txt";
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
function FileExists(filename)
{
    if (fs.existsSync(filename))
    {
        firstTime = false;
    }
    else firstTime = true;
}
function ReadFile(filename)
{
    followerList = fs.readFileSync(filename).toString().split("\n");
    filtered = followerList.filter(Boolean);
    followerList = filtered;
}
function RemoveLine(filename, userid)
{
    fs.readFile(filename, {encoding: 'utf8'}, function(err, data) {
        if (err) throw error;
    
        var dataArray = data.split('\n'); // convert file data in an array
        var searchKeyword = userid; // we are looking for a line, contains, key word  in the file
        var lastIndex = -1; // let say, we have not found the keyword
    
        for (var index=0; index<dataArray.length; index++) {
            if (dataArray[index].includes(searchKeyword)) { // check if a line contains the  keyword
                lastIndex = index; // found a line includes a 'user1' keyword
                break; 
            }
        }
    
        dataArray.splice(lastIndex, 1); // remove the keyword 'user1' from the data Array
    
        // UPDATE FILE WITH NEW DATA
        // IN CASE YOU WANT TO UPDATE THE CONTENT IN YOUR FILE
        // THIS WILL REMOVE THE LINE CONTAINS userid IN YOUR FILE
        var updatedData = dataArray.join('\n');
        fs.writeFile(filename, updatedData, (err) => {
            if (err) throw err;
            console.log ('Successfully updated the current followers file and removing ' + userid);
        });
    
    });
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
        console.log("Checking if currentfollowers.txt file exists");
        FileExists(currentFollowersFilename);
        if (firstTime) {
            console.log("First time running, creating file");
            // going to write to file instead
            // check to see if file exists
            // write the ides to a file
            console.log("Writing current followers to file");
            for(var i = 0; i< ids.ids.length;i++)
            {
                WriteToFile(currentFollowersFilename, ids.ids[i] + "\n");
            }       
            console.log("Done writing current followers to file ");
        } 
        // read from file and put in global list
        //followerList=ids.ids;
        if (followerList.length==0)
        {
            console.log("Reading file and adding values to the global object");
            ReadFile(currentFollowersFilename);
        }
        console.log("Checking for unfollowers");
        // check to see if you have lost any followers
        for (var j = 0; j < followerList.length; j++) {
            var id = followerList[j];
            
            var found = ids.ids.includes(id);
            
            if (!found) {
                WriteToFile('unfollowers.txt', id+"\n");
                // you lost a follower
                console.log("You lost a follower " + id);
                // remove from list
                var index = followerList.indexOf(id);
                followerList.splice(index,1);
                // remove line from current followers file too
                RemoveLine(currentFollowersFilename, id);
            }
        }
        console.log("Checking for new followers");
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
                    WriteToFile("newfollowers.txt", id+"\n");                         
                }
                catch (err) {
                /* Handle the error */
                    console.log(err);
                } finally {
                // something here
                }
                // add it to the list now
                followerList.push(ids.ids[i]);
                // write line to file
                WriteToFile(currentFollowersFilename, ids.ids[i] + "\n");
                console.log("Add " + ids.ids[i] + " to list");
            }
        }
    });
}