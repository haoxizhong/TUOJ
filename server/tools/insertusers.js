var mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/tuojdata')
var user=require('../models/user').user

user.update({
	userid: 'root'
}, {
    $set: {
        userpassword: 'root',
        power: 1
    }
}, {
	upsert: true
}, function(err) {
	if (err) {
		console.warn(err);
	}
});
