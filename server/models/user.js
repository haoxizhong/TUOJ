var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var User = new Schema({
    username: {type: String, unique: true},
	realname: String,
	school: String,
    password: String,
    is_admin: {type: Boolean, default: false}
});
User.plugin(autoIncrement.plugin, "User");

module.exports = mongoose.model("user", User);
