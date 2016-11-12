var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var Contest = new Schema({
    // TODO: Use timestamp instead of String
    starttime: {
        date: String,
        time: String
    },
    endtime: {
        date: String,
        time: String
    },
    name: String,
    problems: [{ type: Number, ref: "Problem"}]
});
Contest.plugin(autoIncrement.plugin, "Contest");

Contest.methods.getProblemRepo = function (id) {
    if (typeof(id) == "string") {
        if (id.length > 1 || id.length == 0) {
            throw new Error("The length of id should be 1.")
        }
    } else if (typeof(id) == "number") {

    } else {
        throw new Error("The type of id should be Number or String")
    }

    if (id >= 0 && id < self.problems.length) {
        return self.problems[id].getRepoPath();
    } else {
        throw new Error("The id is not in the range of self.problems.");
    }
};


module.exports = mongoose.model("contest", Contest);