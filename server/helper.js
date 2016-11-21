var Contest = require('./models/contest');
var SubmitRecord = require('./models/submit_record');

var generateRankList = function(c, callback) {
    SubmitRecord.find({contest: c._id}).populate('user').exec(function (err, records) {
        if (err) callback(err);

        var rank_list = [];
        var user2it = {};
        for (var i = 0; i < records.length; i++) {
            var record =records[i];
            if (user2it[record.user.username] == undefined) {
                user2it[record.user.username] = rank_list.length;
                rank_list.push({
                    user: record.user,
                    total_score:0,
                    details: new Array(c.problems.length).fill({judge: undefined, score: 0})
                });
            }
            var list_it = user2it[record.user.username];
            rank_list[list_it].details[record.contest_problem_id] = {judge: record.judge, score: record.score};
        }

        for (var i = 0; i < rank_list.length; i++) {
            rank_list[i].total_score = 0;
            for (var j = 0; j < rank_list[i].details.length; j++) {
                rank_list[i].total_score += rank_list[i].details[j].score;
            }
        }
        // sort by score in descending order.
        rank_list = rank_list.sort(function (r1, r2) {
            return r2.total_score - r1.total_score;
        });

        callback(null, rank_list);
    });
};

module.exports = {
    generateRankList: generateRankList
};