var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
    _id: {type: String, unique: true, required: true, index: true},
    lastAction: String,
    message: String,
    room: String,
    time: String,
});

var userModel = mongoose.model('Users',userSchema);
module.exports = userModel;

