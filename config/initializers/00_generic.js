if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({accountKey: process.env.NODETIME_ACCOUNT_KEY, appName: 'Lawn Moon Taxes'});
}

module.exports = function() {
  // Any files in this directory will be `require()`'ed when the application
  // starts, and the exported function will be invoked with a `this` context of
  // the application itself.  Initializers are used to connect to databases and
  // message queues, and configure sub-systems such as authentication.

  // Async initializers are declared by exporting `function(done) { /*...*/ }`.
  // `done` is a callback which must be invoked when the initializer is
  // finished.  Initializers are invoked sequentially, ensuring that the
  // previous one has completed before the next one executes.
  this.mime.define({
    'application/x-javascript': ['js']
  });
}
