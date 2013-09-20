var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , InvType = require('./invType')

var MarketDatum = Schema({
  invType: {type: Schema.Types.ObjectId, index: true, ref: 'invType'},
  regionID: {type: Number, index: true},
  date: Date,
  min: Number,
  max: Number,
  average: Number,
  movement: Number,
  count: Number
});

module.exports = mongoose.model('MarketDatum', MarketDatum, 'marketdata');