var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Tax = require('./tax')
  , InvType = require('./invType')

var ProductionLine = Schema({
  tax: {type: Schema.Types.ObjectId, index: true, ref: 'Tax'},  
  invType: {type: Schema.Types.ObjectId, index: true, ref: 'InvType'},
  rate: Number,
  start: Date,
  end: Date
});

module.exports = mongoose.model('ProductionLine', ProductionLine, 'production_lines');