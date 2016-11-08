// debug config file for TUOJ judge client
var sample = require('./sample');
sample.local.tus.clean = false;
sample.local.sandbox.containerId = '875208da5702';
sample.debug = true;
module.exports = sample;
