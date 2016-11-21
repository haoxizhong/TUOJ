var mongoose = require('mongoose')
var autoIncrement = require("mongoose-auto-increment")
mongoose.connect('mongodb://127.0.0.1/tuoj')
autoIncrement.initialize(mongoose.connection);
var User=require('../models/user')

var userList = [{
	username: 'root',
	password: 'root',
	is_admin: 1
}, {
	username: 'player0',
	password: 'player',
}, {
	username: 'player1',
	password: 'player',
}, {
	username: 'player2',
	password: 'player',
}];

userList.forEach(function(userInfo) {
    var user = new User(userInfo);
    user.save(function (err, u) {
        if (err) return console.error(err);
        else console.log(u);
    });
});

// mongoose.disconnect();
