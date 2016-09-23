'use strict';
const uri = 'mongodb://zupaccount:u5q0N72Gtb8vcB0YM7dUVTufP5TEUghDTa2n9pZYtzICGexaIRBLoVUQF4ix4hPIp87MvSWwcEM6NucUcQsYfQ==@zupaccount.documents.azure.com:10250/?ssl=true';
var mongoose = require('mongoose');

var connection = mongoose.connection;

connection.on('error', console.error);
connection.once('open', function() {
  // Create your schemas and models here.
  console.log('mongoose connected');
});

var gracefulExit = function() { 
  mongoose.connection.close(function () {
    console.log('mongoose disconnected because of SIGINT or SIGTERM');
    process.exit(0);
  });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

mongoose.connect(uri);

module.exports = mongoose;