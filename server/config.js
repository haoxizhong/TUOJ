var path = require("path");
var multer  = require('multer');


config = {
    BASE_DIR: __dirname,
    DATA_DIR: path.join(__dirname, "data"),
    PROB_DIR: path.join(__dirname, "data", "problems"),
    USER_SOL_DIR: path.join(__dirname, "data", "user_solutions"),
    TMP_DIR: path.join(__dirname, "data", "tmp"),
    SOURCE_DIR: path.join(__dirname, 'public', 'source'),
    TESTDATA_DIR: path.join(__dirname, 'public', 'test_data'),

    EXPRESS_SESSION: {
        secret:'grejpomvit98c39cmjrfasdolc',
        cookie:{maxAge:1000*60*60*24*30},
        resave: true,
        saveUninitialized: false
    },

    MULTER_UPLOAD: multer({dest: path.join(__dirname, "data", "tmp", "uploads")})
};

module.exports = config;
