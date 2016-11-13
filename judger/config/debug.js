// debug config file for TUOJ judge client
var sample = require('./sample');
sample.local.gitter.noFetch = true;
sample.local.tus.clean = false;
sample.local.sandbox.containerId = 'a0ff8197041e';
sample.debug = true;
module.exports = sample;
