var mongoose = require("mongoose");
var path = require('path');
var urljoin = require('url-join');
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var SOURCE_DIR = require('../config').SOURCE_DIR;
var SITE_URL = require('../config').SITE_URL;

var Judge = new Schema({
    user: {type: Number, ref: "user"},
    contest: {type: Number, ref: "contest"},
    problem: {type: Number, ref: "problem"},

    problem_id: Number,
    subtask_id: Number,

    submitted_time: Number,
    judge_start_time: Number,
    judge_end_time: Number,

    // solution information
    lang: String,
    source_file: String,

    // judge result
    status: String,
    score: Number,
    case_count: Number,
    results: Object
});
Judge.plugin(autoIncrement.plugin, "Judge");

Judge.methods.getSourceURL = function () {
    return urljoin(SITE_URL, 'source', this.source_file);
};

Judge.methods.updateStatus = function (results, callback) {
    self = this;
    Object.keys(results).forEach(function (test_id_str) {
        var test_id = parseInt(test_id_str);
        if (test_id < 0 || test_id > self.case_count) {
            return;
        }

        var result = results[test_id_str];
        //console.log(results[test_id_str]);
        self.results[test_id].status = result["status"];
        self.results[test_id].time = result["time"];
        self.results[test_id].memory = result["memory"];
        if (self.results[test_id].status == "Accepted") {
            self.results[test_id].score = self.problem.getPerCaseScore(self.subtask_id);
        } else {
            self.results[test_id].score = 0;
        }
    });

    var status = "Running";
    var finished = true;
    self.score = 0;
    self.results.forEach(function (s) {
        self.score += s.score;
        if (s.status == "Waiting") {
            finished = false;
        } else {
            if (s.status != "Accepted" && s.status != "Compilation Success" && status == "Running") {
                status = s.status;
            }
        }
    });
    if (finished && status == "Running") {
        status = "Accepted"
    }
    self.status = status;

    self.markModified('results');
    self.save(callback);
};

module.exports = mongoose.model("judge", Judge);
