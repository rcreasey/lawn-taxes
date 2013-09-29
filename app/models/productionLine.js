var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Operation = require('./operation')
  , InvType = require('./invType')

var ProductionLine = Schema({
  // operationID: {type: Schema.Types.ObjectId, index: true, ref: 'Operation'},  
  invType: {type: Schema.Types.ObjectId, index: true, ref: 'InvType'},
  rate: Number,
  start: Date,
  end: Date
});

module.exports = mongoose.model('ProductionLine', ProductionLine, 'production_lines');