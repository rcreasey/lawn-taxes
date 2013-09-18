var passport = require('passport')  
  , login = require('connect-ensure-login')
  , root = require('../app/controllers/root_controller')
  , users = require('../app/controllers/users_controller')

module.exports = function routes() {
  this.get('login', users.login);
  this.post('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }));
  this.get('register', login.ensureLoggedOut('/logout'), users.new);
  this.post('register', login.ensureLoggedOut('/logout'), users.create);
  this.get('logout', users.logout);

  this.root(root.index);
};