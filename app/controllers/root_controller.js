var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , RootController = new Controller()
  , InvType = require('../models/invType')

RootController.index = function(req, res) {
  var self = this;
  InvType.find({}).sort('typeName').exec(function(err, items) {
    res.render('root/index', { title: 'Market', user: req.user, items: items });
  });
};

module.exports = RootController;