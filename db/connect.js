'use strict';
const
  constants = require('../engine/constants'),
  mongoose = require('mongoose');

let connection = mongoose.connection;

connection.on('error', console.error);
connection.once('open', function() {
  // Create your schemas and models here.
  console.log('mongoose connected');
});

let gracefulExit = function() { 
  mongoose.connection.close(function () {
    console.log('mongoose disconnected because of SIGINT or SIGTERM');
    process.exit(0);
  });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

mongoose.connect(constants.DB_URI);

module.exports = mongoose;