var Contest = require('./models/contest');
var SubmitRecord = require('./models/submit_record');

var updateRankList = function (c, rank_list, records, callback) {
    if (typeof(rank_list) == 'undefined') rank_list = [];
    var user2it = {};
    for (var i = 0; i < rank_list.length; i) {
       user2it[rank_list[i].user.usernmae] = i;
    }

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
};

var generateRankList = function(c, user, callback) {
    var find_cond = {};
    var rank_list = [];
    if (c.is_frozen && user.is_admin == false) {
        find_cond = {
            contest: c._id,
            user: user._id
        };
    } else {
        find_cond = {
            contest: c._id
        };
    }

    SubmitRecord.find(find_cond).populate('user').exec(function (err, records) {
        if (err) callback(err);
        updateRankList(contest, rank_list, records, callback);
    });
};

module.exports = {
    generateRankList: generateRankList
};