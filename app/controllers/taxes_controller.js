var async = require('async')
  , locomotive = require('locomotive')
  , _ = require('underscore')
  , bcrypt = require('bcrypt')
  , moment = require('moment')
  , twix = require('twix')
  , Controller = locomotive.Controller
  , TaxesController = new Controller()
  , Tax = require('../models/tax')
  , ProductionLine = require('../models/productionLine')
  , InvType = require('../models/invType')
  , MarketDatum = require('../models/marketDatum')

TaxesController.index = function(req, res) {
  // Tax.find({}).exec(function(err, taxes) {
  //   res.render('taxes/index', { title: 'Taxes', user: req.user, taxes: taxes });
  // });
  res.render('taxes/new', { title: 'Taxes :: Prepare Tax', user: req.user, tax: new Tax(), error: null });
};

TaxesController.show = function(req, res) {
  var id = req.param('id') || false;
  if (!id) res.redirect('/')

  async.waterfall([
    function(callback) {
      Tax.findOne({_id: id}).populate('productionLines').exec(callback);    
    },
    function(tax, callback) {
      if (tax === null) callback();
      async.forEach(tax.productionLines, function(production_line_id, callback) {
        ProductionLine.findById( production_line_id ).populate('invType').exec(function(err, production_line) {

          async.waterfall([
            function(callback){
              MarketDatum.aggregate(
                  { $match: { invType: production_line.invType._id, date: {$gte: production_line.start, $lte: production_line.end} }}
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
                  if (results.length < 1) {
                    callback(err, 0)
                  } else {
                    callback(err, results[0].value);
                  }
                }
              );
            }, function(price, callback) {
              var s = moment(production_line.start);
              var e = moment(production_line.end);
              var range = s.twix(e);
              var per_day = 2400;
              var quantity = per_day * range.count('days');

              callback(null, {price: price, per_day: per_day, quantity: quantity, rate: production_line.rate, start: production_line.start, end: production_line.end, range: range});
            }
          ], function(err, taxes) {
            if (err) callback(err);
            production_line.taxes = taxes;
            tax.productionLines[ _.indexOf(tax.productionLines, production_line_id) ] = production_line
            callback();
          });
        })

      }, function(err) {
        callback(err, tax);
      })
    }
  ], function(err, tax) {
    if (!tax) {
      res.status(404).render('errors/404', {title: "Error :: 404", user: req.user, message: "Tax ID not found"})
    } else {
      res.render('taxes/show', { title: 'Taxes :: Details', user: req.user, tax: tax });
    }
  });

};

TaxesController.new = function(req, res) {
  var tax = new Tax();

  switch(req.params.format) {
    case 'js':
      InvType.find({}).sort('basePrice typeName').exec(function(err, items) {
        res.render('taxes/_production_line_form', {items: items});
      });
      break;
    case 'html':
    default:
      res.render('taxes/new', { title: 'Taxes :: Prepare Tax', user: req.user, tax: tax, error: null });
  }

};

var get_taxrate = function( rarity ) {
  if (rarity < 16) {
    return 0.00
  } else if (rarity == 16) {
    return 0.80    
  } else {
    return 0.90    
  }
}

TaxesController.create = function(req, res) {
  var tax = new Tax();
  var production_lines = new Array();

  var materials = req.body.materials || new Array();

  async.forEach(materials, function(id, callback) {
    async.waterfall([
      function(callback) {
        InvType.findOne({_id: id}, callback)
      },
      function(inv_type, callback) {
        var index = _.indexOf( req.body.materials, id );

        ProductionLine.create({
            invType: inv_type
          , rate: get_taxrate( inv_type.rarity )
          , start: req.body.start[index]
          , end: req.body.end[index]
        }, function (err, production_line) {
          if (err) callback(err);
          production_lines.push( production_line )
          callback();
        });

      }
    ], function() {
      callback();
    });

  }, function(err) {
    if (err || production_lines.length == 0) 
      return res.render('taxes/new', { title: 'Taxes :: Prepare Tax', user: req.user, tax: new Tax(), error: '1: There was a problem with your tax return.  Please try again.' + err});

    tax.productionLines = production_lines;
    tax.save(function(err) {
      if (err)
        return res.render('taxes/new', { title: 'Taxes :: Prepare Tax', user: req.user, tax: new Tax(), error: '2: There was a problem with your tax return.  Please try again. ' + err});

      return res.redirect('taxes/' + tax._id)
    });
  });

};

module.exports = TaxesController;