// debug config file for TUOJ judge client
var sample = require('./sample');
sample.singleRun = true;
sample.local.gitter.noFetch = true;
sample.local.tus.clean = false;
// sample.local.sandbox.containerId = 'a0ff8197041e';
sample.wwwServer.fetchUrl = 'http://localhost:3023/api/judge/get_task/acm';
sample.wwwServer.uploadUrl = 'http://localhost:3023/api/judge/update_results';
sample.debug = true;
module.exports = sample;
