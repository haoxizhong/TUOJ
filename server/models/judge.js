var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var Judge = new Schema({
    user: {type: Number, ref: "User"},
    contest: {type: Number, ref: "Contest"},
    problem: {type: Number, ref: "Problem"},
    subtask_id: Number,

    submitted_time: Number,
    judge_time: Number,

    // solution information
    lang: String,
    source_file: String,

    // judge result
    status: String,
    score: Number,
    cases_count: Number,
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

exports.Judge = mongoose.model("judge", Judge);