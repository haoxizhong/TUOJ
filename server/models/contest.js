var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var Contest = new Schema({
    start_time: Number,
    end_time: Number,
    name: String,
	released: {
		type: Boolean,
		default: false
	},
    problems: [{ type: Number, ref: "problem"}]
});
Contest.plugin(autoIncrement.plugin, "Contest");

Contest.methods.is_frozen = function () {
    var remain = this.end_time - Date.now();
    return remain < 2*60*60*1000 && (remain > 0 || !this.released);
};

Contest.methods.get_status = function () {
    var now = Date.now();
    if (now < this.start_time) {
        return 'unstarted';
    } else if (now > this.end_time) {
        return 'ended';
    } else {
        return 'in_progress';
    }
};

module.exports = mongoose.model("contest", Contest);
