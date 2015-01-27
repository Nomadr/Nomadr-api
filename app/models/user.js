var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
var Schema  = mongoose.Schema

var UserSchema = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  city: {type: String, required: true},
  geocoordinates: {type: String, required: true}
})

UserSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', UserSchema)
