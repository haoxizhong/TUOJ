var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var Contest = new Schema({
    start_time: Number,
    end_time: Number,
    name: String,
    problems: [{ type: Number, ref: "problem"}],
    is_frozen: { type: Boolean, default: false }
});
Contest.plugin(autoIncrement.plugin, "Contest");

module.exports = mongoose.model("contest", Contest);