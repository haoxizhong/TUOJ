var mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment");
var Step = require('step');
mongoose.connect('mongodb://127.0.0.1/tuoj');

var Judge = require('../models/judge');

var rejudge_dangerous = function() {
    Step(function () {
        Judge.find({}, this);
    }, function (err, judges) {
        if (err) throw err;
        judges.forEach(function (j) {
            var is_dp = false;
            if (j.status == "Dangerous Program") {
                is_dp = true;
            }
            judges.results.forEach(function (r) {
                if (typeof(r.status) != 'undefined') {
                    if (r.status == "Dangerous Program") {
                        is_dp = true;
                    }
                }
            });

            if (is_dp) {
                j.rejudge(function (err, j) {
                    if (err) console.errof(err);
                    else console.log(j._id + " is added into judge list.");
                });
            }
        });
    });
};

rejudge_dangerous();