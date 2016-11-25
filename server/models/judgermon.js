var mongoose = require('mongoose');
var JudgerMon = new mongoose.Schema({
	ip: String,
	lastPing: Number
});
module.exports = mongoose.model('judgermon', JudgerMon);
