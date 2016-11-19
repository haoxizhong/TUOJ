var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var SubmitRecord = new Schema({
    user: {type: Number, ref: "User"},
    contest: {type: Number, ref: "Contest"},
    problem: {type: Number, ref: "Problem"},
    score: Number,
    submitted_times: Numebr,
    subtasks: [{type: Number, ref: "Judge"}]
});
SubmitRecord.plugin(autoIncrement.plugin, "SubmitRecord");

exports.SubmitRecord = mongoose.model("submit_record", SubmitRecord);