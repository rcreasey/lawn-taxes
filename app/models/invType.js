var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var InvType = Schema({
  typeID: {type: Number, index: true, unique: true},
  groupID: {type: Number, index: true},
  marketGroupID: {type: Number, index: true},
  typeName: String,
  description: String,
  volume: Number
});

module.exports = mongoose.model('InvType', InvType, 'invTypes');