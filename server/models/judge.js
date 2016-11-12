var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var Judge = new Schema({
    user: {type: Number, ref: "User"},
    contest: {type: Number, ref: "Contest"},
    problem: {type: Number, ref: "Problem"},
    subtask: Number,
    submitted_time: String, // TODO: Use timestamp instead of String

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

exports.Judge = mongoose.model("judge", Judge);