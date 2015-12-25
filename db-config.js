var DB_USER = 'yourbaruser',
    DB_PASS = 'notyourbarpassword',
    DB_URL = 'mongodb://' + DB_USER + ':' + DB_PASS + '@ds063892.mongolab.com:63892/yourbar',
    mongo = require('mongodb').MongoClient;

module.exports.init = function (callback) {
    mongo.connect(DB_URL, function (err, db) {
        module.exports.db = db;
        callback(err);
    });
};