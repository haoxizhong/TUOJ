var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/tuojdata')
var user=require('../models/user').user

var userList = [{
	userid: 'root',
	userpassword: 'root',
	power: 1
}, {
	userid: 'player0',
	userpassword: 'player',
}];

userList.forEach(function(userInfo) {
    user.update({}, { $set: userInfo }, { upsert: true }, function(err) {
        if (err) {
            return console.warn(err);
        }
        console.log('done');
    });
});

mongoose.disconnect();
