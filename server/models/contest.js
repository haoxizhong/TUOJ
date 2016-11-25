var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var Contest = new Schema({
    start_time: Number,
    end_time: Number,
    name: String,
    problems: [{ type: Number, ref: "problem"}]
});
Contest.plugin(autoIncrement.plugin, "Contest");

Contest.methods.is_frozen = function () {
    var remain = this.end_time - Date.now();
    return remain < 60*60*1000 && remain > 0;
};

Contest.methods.get_status = function () {
    var now = Date.now();
    if (now < this.start_time) {
        return 'unstated';
    } else if (now > this.end_time) {
        return 'ended';
    } else {
        return 'in_progress';
    }
};

module.exports = mongoose.model("contest", Contest);
