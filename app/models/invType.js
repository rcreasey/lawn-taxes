var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , MarketDatum = require('./marketDatum')

var InvType = Schema({
  typeID: {type: Number, index: true, unique: true},
  groupID: {type: Number, index: true},
  marketGroupID: {type: Number, index: true},
  typeName: String,
  description: String,
  volume: Number
});

InvType.methods.market_data = function( callback ) {
  this.model('MarketDatum').find({ invType: this._id }).populate('typeID').sort('-date').exec(function(err, market_datums) {
    if (err) throw err;
    return market_datums;
  });
}

module.exports = mongoose.model('InvType', InvType, 'invTypes');