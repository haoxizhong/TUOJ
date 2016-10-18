// debug config file for TUOJ judge client
var sample = require('./sample');
sample.local.tus.clean = false;
sample.debug = true;
sample.wwwServer.fetchUrl = 'http://166.111.69.47:3333/api/judger/adopt',

sample.wwwServer.uploadUrl = 'http://166.111.69.47:3333/api/judger/upload',
module.exports = sample;
