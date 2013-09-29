var passport = require('passport')  
  , login = require('connect-ensure-login')
  , market = require('../app/controllers/market_controller')
  , taxes = require('../app/controllers/taxes_controller')
  , users = require('../app/controllers/users_controller')

module.exports = function routes() {
  this.get('login', users.login);
  this.post('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }));
  this.get('register', login.ensureLoggedOut('/logout'), users.new);
  this.post('register', login.ensureLoggedOut('/logout'), users.create);
  this.get('logout', users.logout);

  this.get('/taxes/?', taxes.index)
  this.get('/taxes/new.:format?', taxes.new)
  this.get('/taxes/:taxID/?', taxes.show)
  this.post('/taxes/?', taxes.create)

  this.get('/market/?', market.index)
  this.get('/market/:typeID', market.show)
  this.post('/market/:typeID/taxes', market.taxes)

  this.root(market.index);
};