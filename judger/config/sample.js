// sample config file for TUOJ judge client
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
            path: __dirname + '/../data/probs/',
        },
        tus: {
            path: __dirname + '/../tmp/',
			maxLines: 256,
            clean: true
        }
	}
};
