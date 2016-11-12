var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;
var path = require("path");

var PROB_DIR = require("../config.js").PROB_DIR;

var Problem = new Schema({
    git_url: String,
    repo_name: {type: String, unique: true},
    subtasks: [
        {
            score: Number,
            case_count: Number
        }
    ]
});
Problem.plugin(autoIncrement.plugin, "Problem");

Problem.methods.getRepoPath = function() {
    return path.join(PROB_DIR, self.repo_name);
};

module.exports = mongoose.model("problem", Problem);
