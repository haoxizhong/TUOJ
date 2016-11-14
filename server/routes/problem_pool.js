var express = require("express");
var router = express.Router();

var Problem = require("../models/problem.js");

router.get("/", function(req, res, next) {
    Problem.find(function(err, problems) {
        res.render("problem_pool", {
            problems: problems,
            user: req.session.user,
            is_admin: req.session.is_admin
        });
    });
});


router.get("/[0-9]+", function(req, res, next) {

});


router.post("/new_problem", function(req, res, next) {
    git_url = req.body.git_url.trim();
    if (git_url.length < 1) {
        return next(new Error("Please enter the address of Git."));
    }

    Problem.new(git_url, function (err, p) {
        p.update(function (err, p) {
            console.log(p);
        });
    });

    return res.redirect("/problem_pool");
});

router.post("/[0-9]+/update", function(req, res, next) {

});

module.exports = router;
