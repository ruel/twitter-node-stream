/*
 * twitter.js
 */

var tweetjs = require('twitter');
var websocket = require('websocket');
var config = require('./config.js');

// This is where the keys go
var keys = {
    consumer_key:           config.consumer_key, 
    consumer_secret:        config.consumer_secret, 
    access_token_key:       config.access_token_key, 
    access_token_secret:    config.access_token_secret 
};

var cons = [];

// This will be called on the server
exports.initWs = function(http) {

    // Our main variables
    var server = new websocket.server( { httpServer : http } );
    var twitter = new tweetjs(keys);


    // Catch the request
    server.on('request', function(request) {

        // Accept incoming connection
        var connection = request.accept();
        console.log("Connection established");
    
        // Record the connection's data
        var conObj = {
            connection  : connection,
            keyword     : '',
            stream      : null
        };

        var index = cons.push(conObj) - 1;

        // If a message has been received, the data should the keyword(s)
        connection.on('message', function(data) {
           
            // Incoming keyword:
            cons[index].keyword = data.utf8Data;
            console.log("Incoming keyword: " + cons[index].keyword);

            // Verify that there's data
            if (data.utf8Data.length > 0) {

                console.log('Connecting to twitter stream API');

                // Start streaming
                twitter.stream('statuses/filter', { track : cons[index].keyword }, function(stream) {
                    
                    // We can just assign this newly created stream :)
                    cons[index].stream = stream;
                    
                    // Send to websocket every tweet
                    cons[index].stream.on('data', function(data) {
                       
                        if (data.id_str !== undefined) { 
                            
                            // Trim the data, we don't need to send the whole thing yet
                            var tweet = {
                                id_str : data.id_str,
                                text : data.text,
                                user : {
                                    profile_image_url : data.user.profile_image_url,
                                    name : data.user.name,
                                    screen_name : data.user.screen_name
                                }
                            };
                            cons[index].connection.sendUTF(JSON.stringify(tweet));
                        }
                    });
                });
            }
        });
    });
}
