'use strict';
var MongoClient = require('mongodb').MongoClient;
var rockhawkdb=null;

exports.connect = function(url, callback) {
    if (rockhawkdb) return callback();
    MongoClient.connect(url, function(err, db) {
        if (err) return callback(err);
        rockhawkdb = db;
        callback();
    })
};
exports.close = function(callback) {
    if (rockhawkdb) {
        rockhawkdb.close(function(err, result) {
            rockhawkdb = null;
            callback(err)
        })
    }
};
exports.getDb = function() {
    return rockhawkdb;
};