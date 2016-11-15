var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/tuojdata')
var user=require('../models/models').user

var userList = [{
	userid: 'root',
	userpassword: 'root',
	power: 1
}, {
	userid: 'player0',
	userpassword: 'player',
}];

userList.forEach(function(userInfo) {
    user.update({ userid: userInfo.userid }, { $set: userInfo }, { upsert: true }, function(err) {
        if (err) {
            return console.warn(err);
        }
        console.log(userInfo.userid + ' inserted');
    });
});

mongoose.disconnect();
