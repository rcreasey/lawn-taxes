var express = require('express');

module.exports = function() {
  this.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  this.set('db-uri', process.env.MONGO_URL);
  this.set('view options', {
    pretty: true
  });
};
