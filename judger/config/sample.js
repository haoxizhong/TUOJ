// sample config file for TUOJ judge client
var path = require('path');
var fs = require('fs-extra');
var path = require('path');

module.exports = {
	judgerType: 'traditional',
	wwwServer: {
		verify: {
			username: 'sampleUsername',
			password: 'samplePassword'
		},
		fetchUrl: 'http://localhost:3333/api/judger/adopt',
		uploadUrl: 'http://localhost:3333/api/judger/upload',
		reqInterval: 1000
	},
	local: {
        gitter: {
            path: path.resolve(__dirname, '../../samples/test-data/probs/')
        },
        tus: {
            path: path.resolve(__dirname, '../../samples/test-data/runs/'),
			maxLines: 256,
            clean: true
        }
	}
};

fs.ensureDirSync(path.resolve(__dirname, '../../samples/test-data'));
fs.ensureDirSync(module.exports.local.gitter.path);
fs.ensureDirSync(module.exports.local.tus.path);

