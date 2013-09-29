var async = require('async')
  , locomotive = require('locomotive')
  , _ = require('underscore')
  , crypto = require('crypto')
  , shasum = crypto.createHash('sha1')
  , moment = require('moment')
  , twix = require('twix')
  , Controller = locomotive.Controller
  , OperationsController = new Controller()
  , Operation = require('../models/operation')
  , ProductionLine = require('../models/productionLine')
  , InvType = require('../models/invType')

OperationsController.index = function(req, res) {
  Operation.find({}).exec(function(err, operations) {
    res.render('operations/index', { title: 'Operations', user: req.user, operations: operations });
  });
};

OperationsController.show = function(req, res) {
  var operationID = req.param('operationID') || false;
  if (!operationID) res.redirect('/')

  Operation.findOne({operationID: operationID}).populate('productionLines').exec(function(err, operation) {
    operation.productionLines[0].populate('invType')
    res.render('operations/show', { title: 'Operations :: Details', user: req.user, operation: operation });
  });
};

OperationsController.new = function(req, res) {
  var operation = new Operation();

  switch(req.params.format) {
    case 'js':
      InvType.find({}).sort('basePrice typeName').exec(function(err, items) {
        res.render('operations/_production_line_form', {items: items});
      });
      break;
    case 'html':
    default:
      res.render('operations/new', { title: 'Operations :: Create Operation', user: req.user, operation: operation });
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

OperationsController.create = function(req, res) {
  var operation = new Operation();
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
    operation.operationID = shasum.digest('hex')

    operation.productionLines = production_lines;
    operation.save(function(err) {
      res.redirect('operations/' + operation.operationID)
    });
  });

};

module.exports = OperationsController;