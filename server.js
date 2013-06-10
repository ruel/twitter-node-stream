/*
 * server.js
 */

var http = require('http');
var express = require('express');
var twitter = require('./twitter.js');

var app = express();

var server = http.createServer(app);
server.listen(1337);

// Send in the HTML :)
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/html/index.html');
});

// Serve static js files
app.get('/js/*.js', function(request, response) {
    response.sendfile(__dirname + request.path);
});


// Initialize the websocket
twitter.initWs(server);

process.setgid('www-data');
process.setuid('www-data');
