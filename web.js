var express = require('express');

var fs = require ('fs');   //Use built-in filesystem library
var inputfilename = "index.html";	//Define file name to read from


var app = express.createServer(express.logger());


app.get('/', function(request, response) {
    inputfilebuffer=fs.readFileSync(inputfilename);
    response.send(inputfilebuffer.toString('utf-8'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
