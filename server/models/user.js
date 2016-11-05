var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var path = require("path");

var PROB_DIR = require("../config.js").PROB_DIR;

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

// TODO: Split users.js into independent files.

Contest.methods.getProblemRepo = function (id) {
	if (id < this.gitlist.length) {
		return path.join(PROB_DIR, "contest_" + String(this.id), "problem_" + String(id));
	} else {
		throw "id is greater than the number of problems."
	}
};

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