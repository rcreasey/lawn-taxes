var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , MarketDatum = require('./marketDatum')

var InvType = Schema({
  typeID: {type: Number, index: true, unique: true},
  groupID: {type: Number, index: true},
  marketGroupID: {type: Number, index: true},
  typeName: String,
  description: String,
  basePrice: Number,
  volume: Number,
  mass: Number
});

InvType.methods.market_data = function( callback ) {
  this.model('MarketDatum').find({ invType: this._id }).populate('typeID').sort('-date').exec(function(err, market_datums) {
    if (err) return false;
    return market_datums;
  });
}

InvType.virtual('rarity').get(function() {
  switch(this.basePrice) {
    case 8: return 8; break;
    case 16: return 16; break;
    case 64: return 32; break;
    case 256: return 64; break; 
    default: return 4; break;
  }
});

module.exports = mongoose.model('InvType', InvType, 'invTypes');