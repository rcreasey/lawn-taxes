var async = require('async')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps
  , moment = require('moment')
  , restClient = require('node-rest-client').Client
  , _ = require('underscore')
  , xml = require('xml2js').parseString

var InvType = require(root + '/app/models/invType')
  , MarketDatum = require(root + '/app/models/marketDatum')
// mongoose.set('debug', true)

'use strict';

module.exports = function(grunt) {
  grunt.registerTask('update', 'Updates market prices from Goonmetrics.', function() {

    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;

    var count = 0;

    grunt.log.write('-----> Fetching market prices\n');

    var callback = this.async();
    var goonmetrics = new restClient();

    async.waterfall([
      function(callback) {
        InvType.find({}, {"typeID": 1}, callback);
      }, 
      function(items, callback) {
        var item_types = _.map(items, function(item) { return item.typeID; });
        var regionID = '10000002';
        var url = "http://goonmetrics.com/api/price_history/?region_id=" + regionID + "&type_id=" + String(item_types)

        async.waterfall([
          function(callback) {
            goonmetrics.get(url, function(data, response) { callback(null, data); }); 
          },
          function(data, callback) {
            xml(data, function(err, result) {
              callback(null, result.goonmetrics.price_history[0].type);
            })
          }, function(types, callback) {
 
            async.forEach(types, function(type, callback) {
              var typeID = _.find(items, function(item) { return item.typeID == type.$.id });

              async.forEach(type.history, function(item, callback) {
                var date  = moment(item.$.date)._d
                var datum = {invType: typeID._id, regionID: parseInt(regionID), 
                             date: date, movement: parseInt(item.$.movement), volume: parseInt(item.$.numOrders),
                             min: parseFloat(item.$.minPrice), max: parseFloat(item.$.maxPrice), average: parseFloat(item.$.avgPrice)};

                MarketDatum.update({invType: typeID._id, regionID: regionID, date: date}, {$set: datum}, {upsert: true}, callback);
                count += 1;
                grunt.log.write('.');
              }, function(err) {
                if (err) throw err;
                callback();
              })

            }, function(err) {
              if (err) throw err;
              callback();
            });
 
          }
        ], function() {
          callback();
        });

      }
    ], function() {
      grunt.log.write('\n       %s Items Updated: ', count);
      mongoose.disconnect();
      grunt.log.ok();
      callback();
    });


    return true;
  });

  grunt.registerTask('cleanup', 'Removes market data older than 90 days.', function() {
    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;
    var count = 0;
    var callback = this.async();

    grunt.log.write('-----> Cleaning up market data\n');

    async.waterfall([
      function(callback) {
        MarketDatum.find({date: {$lt: moment().subtract('day', 90)._d}}).exec(function(err, results) {
          callback(null, results);
        })
      }, function(results, callback) {
        async.forEach(results, function(result, callback) {
          result.remove(function(err) {
            if (err) throw err;
            count += 1;
            grunt.log.write('.');
            callback();
          })
        })
        callback();
      }
    ], function() {
      grunt.log.write('\n       %s Market Datums Removed: ', count);
      mongoose.disconnect();
      grunt.log.ok();
      callback();
    });

    return true;
  });
};
