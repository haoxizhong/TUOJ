// apply config file for TUOJ judge client
var sample = require('./sample');
//sample.singleRun = true;
sample.local.gitter.noFetch = true;
//sample.local.tus.clean = false;
// sample.local.sandbox.containerId = 'a0ff8197041e';
sample.wwwServer.fetchUrl = 'https://ccsp.cspro.org/api/judge/get_task/acm';
sample.wwwServer.uploadUrl = 'https://ccsp.cspro.org/api/judge/update_results/acm';
sample.debug = false;
sample.wwwServer.verify.token = 'faf3ar42q34';
module.exports = sample;
