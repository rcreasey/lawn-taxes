var async = require('async')
  , locomotive = require('locomotive')
  , _ = require('underscore')
  , crypto = require('crypto')
  , shasum = crypto.createHash('sha1')
  , moment = require('moment')
  , twix = require('twix')
  , Controller = locomotive.Controller
  , TaxesController = new Controller()
  , Tax = require('../models/tax')
  , ProductionLine = require('../models/productionLine')
  , InvType = require('../models/invType')

TaxesController.index = function(req, res) {
  Tax.find({}).exec(function(err, taxes) {
    res.render('taxes/index', { title: 'Taxes', user: req.user, taxes: taxes });
  });
};

TaxesController.show = function(req, res) {
  var taxID = req.param('taxID') || false;
  if (!taxID) res.redirect('/')

  Tax.findOne({taxID: taxID}).populate('productionLines').exec(function(err, tax) {
    res.render('taxes/show', { title: 'Taxes :: Details', user: req.user, tax: tax });
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
      res.render('taxes/new', { title: 'Taxes :: Prepare Tax', user: req.user, tax: tax });
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

  async.forEach(req.body.materials, function(id, callback) {

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
          if (err) throw err;
          production_lines.push( production_line )
          callback();
        });

      }
    ], function() {
      callback();
    });

  }, function(err) {
    shasum.update( moment().unix() + JSON.stringify( req.body ) )
    tax.taxID = shasum.digest('hex')

    tax.productionLines = production_lines;
    tax.save(function(err) {
      res.redirect('taxes/' + tax.taxID)
    });
  });

};

module.exports = TaxesController;