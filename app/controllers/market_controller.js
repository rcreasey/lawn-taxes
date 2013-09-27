var async = require('async')
  , moment = require('moment')
  , twix = require('twix')
  , locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , MarketController = new Controller()
  , InvType = require('../models/invType')
  , MarketDatum = require('../models/marketDatum')

MarketController.index = function(req, res) {
  InvType.find({}).sort('basePrice typeName').exec(function(err, items) {
    res.render('market/index', { title: 'Market', user: req.user, items: items });
  });
};

MarketController.show = function(req, res) {
  var typeID = req.param('typeID') || false;
  if (!typeID) res.redirect('/')

  async.waterfall([
    function(callback){
      InvType.findOne({typeID: typeID}, callback);
    },
    function(invType, callback){
      if (invType === null) {
        res.redirect('/')        
      } else {
        MarketDatum.find({invType: invType._id}).populate('invType').sort('-date').exec(function(err, datums) {
          callback(err, invType, datums);
        })        
      }
    }
  ], function (err, invtype, datums) {
    res.render('market/show', { title: 'Market :: Details', user: req.user, invtype: invtype, datums: datums });
  });
};

MarketController.taxes = function(req, res) {
  var typeID = req.param('typeID') || false;
  if (!typeID) res.redirect('/')

  var start = moment(req.body.start, 'MM-DD-YYYY')
  var end   = moment(req.body.end, 'MM-DD-YYYY')
  var range = start.twix(end)

  async.waterfall([
    function(callback){
      InvType.findOne({typeID: typeID}, callback);
    },
    function(invType, callback){
      MarketDatum.find({invType: invType._id}).populate('invType').sort('-date').exec(function(err, datums) {
        callback(err, invType, datums);
      });
    },
    function(invType, datums, callback){
      MarketDatum.aggregate(
          { $match: { invType: invType._id, date: {$gte: start._d, $lte: end._d} }}
        , { $project: { 
                _id: {
                    year : { $year : "$date" }
                  , month : { $month : "$date" }
                  , day : { $dayOfMonth : "$date" }
                }
              , invType: 1
              , min: 1
              , max: 1
              , average: 1
          }}
        , { $group: { _id: '$invType', value: {$avg: "$average"} }}
        , function(err, results) {
          if (err) throw err;
          callback(err, invType, datums, results[0].value);
        }
      );
    }
  ], function (err, invtype, datums, price) {
    var per_day = 2400;
    var quantity = per_day * range.count('days')

    var taxes = {price: price, per_day: per_day, quantity: quantity, rate: req.body.rate, start: start, end: end, range: range};
    res.render('market/taxes', { title: 'Market :: Taxes', user: req.user, invtype: invtype, datums: datums, taxes: taxes });
  });

};

module.exports = MarketController;