var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var type1= new Schema({
	userid: String,
	userpassword: String
});

var type2= new Schema({
	id: Number,
	starttime: {
		date: String,
		time: String,
	},
	endtime: {
		date: String,
		time: String,
	},
	name: String,
	gitlist: [String]
});

var type3= new Schema({
	runId: Number,
	probGit: String,
	lang: String,
	answer: [String],
	pd: Number
});

exports.user=mongoose.model('user',type1)
exports.contest=mongoose.model('contest',type2)
exports.judge=mongoose.model('judge',type3)