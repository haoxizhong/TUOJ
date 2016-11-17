var mongoose = require("mongoose");
var path = require('path');
var urljoin = require('url-join');
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var SOURCE_DIR = require('../config').SOURCE_DIR;
var SITE_URL = require('../config').SITE_URL;

var Judge = new Schema({
    user: {type: Number, ref: "User"},
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
    results: [
        {
            status: String,
            score: Number,
            time: Number,
            memory: Number
        }
    ]
});
Judge.plugin(autoIncrement.plugin, "Judge");

Judge.methods.getSourceURL = function () {
    return urljoin(SITE_URL, 'source', this.source_file);
};

module.exports = mongoose.model("judge", Judge);