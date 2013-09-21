var async = require('async')
  , locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , MarketController = new Controller()
  , InvType = require('../models/invType')
  , MarketDatum = require('../models/marketDatum')

MarketController.index = function(req, res) {
  InvType.find({}).sort('typeName').exec(function(err, items) {
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
      MarketDatum.find({invType: invType._id}).populate('invType').sort('-date').exec(function(err, datums) {
        callback(err, invType, datums);
      })
    }
  ], function (err, invtype, datums) {
    res.render('market/show', { title: 'Market', user: req.user, invtype: invtype, datums: datums });
  });
};


// {
//   "_id": { "$oid" : "523c918091f90faf89d56a9b" },
//   "average": 5094.3299999999999272,
//   "count": 76,
//   "date": { "$date": 1379228400000.000000 },
//   "invType": { "$oid" : "5211f43feaa0d47675c7b61b" },
//   "max": 5094.5200000000004366,
//   "min": 4923.1599999999998545,
//   "movement": 2189038,
//   "regionID": 10000002
// }

module.exports = MarketController;