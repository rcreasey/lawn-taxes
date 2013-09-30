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

module.exports = MarketController;