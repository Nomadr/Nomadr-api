var mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator')
var Schema  = mongoose.Schema

var UserSchema = new Schema({
  name: {type: String, required: true},
  // FIXME: need to implement uniqueness validator for email
  // Mongoose doesn't have one natively but there is a package
  // for it
  email: {type: String, required: true, unique: true},
  city: {type: String, required: true}
})

userSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', UserSchema)
