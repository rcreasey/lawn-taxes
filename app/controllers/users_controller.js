var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = locomotive.Controller
  , UsersController = new Controller()
  , User = require('../models/user')

UsersController.index = function(req, res) {
  var self = this;
  User.find({}).exec(function(err, users) {
    res.render('users/index', { title: 'Users', user: req.user, users: users });

  });
};

UsersController.login = function(req, res) {
  res.render('users/login', { title: 'Login', user: req.user, messages: req.flash('error') });
};

UsersController.new = function(req, res) {
  res.render('users/register', { title: 'Register', user: req.user, messages: req.flash('error') });
};

UsersController.create = function(req, res) {  
  User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
    if (err)
      return res.render('register', { title: 'Register', user: req.user, messages: err });

    res.redirect('/');
  });
};

UsersController.logout = function(req, res) {  
  req.logout();
  return res.redirect('/');
};


UsersController.destroy = function (req, res) {
  var self = this;
  User.findOne({_id: req.body.id }).exec(function(err, user) {
    user.remove(function(err) {
      if (err)
        res.send(err);

      res.redirect('/users');
    });
  });
};

module.exports = UsersController;