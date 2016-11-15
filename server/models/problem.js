var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;
var path = require("path");
var fse = require("fs-extra");
var git = require("nodegit");
var randomstring = require("randomstring");
var markdown = require("markdown").markdown;

var PROB_DIR = require("../config.js").PROB_DIR;
var TMP_DIR  = require("../config.js").TMP_DIR;

var Problem = new Schema({
    git_url: String,
    repo_name: String,

    title: String,
    meta: Object,

    status: String, // new problem/updating/update failed/update success

    subtasks: Object
});
Problem.plugin(autoIncrement.plugin, "Problem");

Problem.statics.new = function(git_url, callback) {
    var p = new this();
    p.git_url = git_url;
    p.repo_name = randomstring.generate(8);
    p.title = "Waiting For Fetching";
    p.status = "New Problem";
    p.save(callback);
};

Problem.methods.getDescriptionHTML = function() {
    var description_path = path.join(this.getRepoPath(), "files", "description.md");
    var description = markdown.toHTML(String(fse.readFileSync(description_path)));
    return description;
};

Problem.methods.updateInfo = function(json_file, callback) {
    try {
        var info = fse.readFileSync(json_file);
        info = JSON.parse(info);
        console.log(info);

        this.title = info.title;
        this.meta = info.meta;
        this.subtasks = info.subtasks;
        this.status = "Success";
        this.save(callback);
    } catch(err) {
        return callback(err);
    }
};

Problem.methods.update = function(callback) {
    this.status = "Updating";
    this.save(function (err, p) {
        repo = p.getRepoPath();
        tmp_repo = randomstring.generate(8);
        tmp_repo = path.join(TMP_DIR, tmp_repo);

        git.Clone(p.git_url, tmp_repo).then(function (repository) {
            fse.remove(repo, function (err) {
                if (err) return callback(err);
                fse.move(tmp_repo, repo, function (err) {
                    if (err) return callback(err);
                    p.updateInfo(path.join(repo, "prob.json"), callback);
                });
            });
        }, function (err) {
            return callback(err);
        });
    });
};

Problem.methods.getRepoPath = function() {
    return path.join(PROB_DIR, this.repo_name);
};

module.exports = mongoose.model("problem", Problem);