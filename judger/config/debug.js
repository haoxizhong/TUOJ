// debug config file for TUOJ judge client
var sample = require('./sample');
//sample.singleRun = true;
sample.local.gitter.noFetch = true;
sample.local.tus.clean = false;
// sample.local.sandbox.containerId = 'a0ff8197041e';
// sample.wwwServer.fetchUrl = 'http://183.172.153.141:3333/api/judge/get_task/acm';
// sample.wwwServer.uploadUrl = 'http://183.172.153.141:3333/api/judge/update_results';
sample.wwwServer.fetchUrl = 'http://localhost:3023/api/judge/get_task/acm';
sample.wwwServer.uploadUrl = 'http://localhost:3023/api/judge/update_results/acm';
sample.debug = true;
sample.wwwServer.verify.token = 'faf3ar42q34';
module.exports = sample;
