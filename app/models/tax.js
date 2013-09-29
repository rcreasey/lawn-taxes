var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ProductionLine = require('./productionLine')

var Tax = Schema({
  taxID: {type: String, unique: true, index: true},  
  productionLines: [{type: Schema.Types.ObjectId, index: true, ref: 'ProductionLine'}],
});

module.exports = mongoose.model('Tax', Tax, 'taxes');