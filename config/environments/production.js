var express = require('express');

module.exports = function() {
  this.set('db-uri', process.env.MONGO_URL);
  this.set('view options', {
    pretty: true
  });
}
