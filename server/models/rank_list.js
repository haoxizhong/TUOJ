var mongoose = require("mongoose");
var autoIncrement = require("mongoose-auto-increment");
var Schema = mongoose.Schema;

var RankList = new Schema({
    contest: {type: Number, ref: 'contest'},
    generated_time: Number,
    list: Object
});
RankList.plugin(autoIncrement.plugin, "RankList");

module.exports = mongoose.model("rank_list", RankList);