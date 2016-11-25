var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var SubmitRecord = new Schema({
    user: {type: Number, ref: "user"},
    contest: {type: Number, ref: "contest"},
    contest_problem_id: Number,
    judge: {type: Number, ref: 'judge'},
    score: {type: Number, default: 0},
    submitted_times: {type: Number, default: 0}
});
SubmitRecord.plugin(autoIncrement.plugin, "SubmitRecord");

SubmitRecord.statics.getSubmitRecord = function (user_id, contest_id, contest_problem_id, callback) {
    self = this;
    mongoose.model('submit_record').findOne({user: user_id, contest: contest_id, contest_problem_id: contest_problem_id},function (err, s) {
        if (err) return callback(err);
        if (s) return callback(err, s);

        s = new self();
        s.user = user_id;
        s.contest = contest_id;
        s.contest_problem_id = contest_problem_id;

        s.save(callback);
    });
};

SubmitRecord.methods.update = function (judge, callback) {
    if (judge.status == "Compilation Error") {
        this.submitted_times -= 1;
    } if (judge.score >= this.score) {
        this.score = judge.score;
        this.judge = judge._id;
    }
    this.save(callback);
};

module.exports = mongoose.model("submit_record", SubmitRecord);
