var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = new Schema({
	userid: String,
	userpassword: String,
	power: Number
});

var Contest = new Schema({
	id: Number,
	starttime: {
		date: String,
		time: String
	},
	endtime: {
		date: String,
		time: String
	},
	name: String,
	gitlist: [String]
});

var Judge = new Schema({
	runId: Number,
	userid: String,
	contestid: Number,
	probGit: String,
	lang: String,
	answer: [String],
	pd: Number,
	score : Number
	
});

exports.user=mongoose.model('user', User);
exports.contest=mongoose.model('contest', Contest);
exports.judge=mongoose.model('judge', Judge);