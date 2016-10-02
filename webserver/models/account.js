var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var Account = new Schema({
    username: String,
    displayName: String,
    password: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);

