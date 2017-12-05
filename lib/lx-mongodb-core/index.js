'use strict';

var util = require('util'),
    mongodb = require('mongodb'),
    MongoClient = require('mongodb').MongoClient,
    EventEmitter = require('events').EventEmitter;

var isError = function (err) { // inlined from util so this works in the browser
    return Object.prototype.toString.call(err) === '[object Error]';
};

var thunky = function (fn) {
    var state;

    var run = function (callback) {
        var stack = [callback];

        state = function (callback) {
            stack.push(callback);
        };

        fn(function (err) {
            var args = arguments;
            var apply = function (callback) {
                if (callback) {
                    callback.apply(null, args);
                }
            };

            state = isError(err) ? run : apply;
            while (stack.length) {
                apply(stack.shift());
            }
        });
    };

    state = run;

    return function (callback) {
        state(callback);
    };
};

var toConnectionString = function (conf) { // backwards compat config map (use a connection string instead)
    var options = [];
    var hosts = conf.replSet ? conf.replSet.members || conf.replSet : [conf];
    var auth = conf.username ? (conf.username + ':' + conf.password + '@') : '';

    hosts = hosts.map(function (server) {
        if (typeof server === 'string') {
            return server;
        }

        return (server.host || '127.0.0.1') + ':' + (server.port || 27017);
    }).join(',');

    if (conf.slaveOk) {
        options.push('slaveOk=true');
    }

    return 'mongodb://' + auth + hosts + '/' + conf.db + '?' + options.join('&');
};

var parseConfig = function (cs) {
    if (typeof cs === 'object' && cs) {
        return toConnectionString(cs);
    }

    if (typeof cs !== 'string') {
        throw new Error('connection string required');
    }

    // to avoid undef errors on bad conf
    cs = cs.replace(/^\//, '');

    if (cs.indexOf('/') < 0) {
        return parseConfig('127.0.0.1/' + cs);
    }

    if (cs.indexOf('mongodb://') !== 0) {
        return parseConfig('mongodb://' + cs);
    }

    return cs;
};

var Collection = function (strCollection, database) {
    var _db = database;
    var _name = strCollection;
    var _getCollection = thunky(function (callback) {
        _db.prepare(function (err, db) {
            db.collection(_name, {}, callback);
        });
    });

    this.prepare = _getCollection;
};

var Database = function (strConnection) {
    var self = this;

    var connect = thunky(function (callback) {
        MongoClient.connect(strConnection, {}, function (err, db) {
            if (err) {
                return callback(err);
            }

            self.client = db;
            self.emit('ready');

            db.on('error', function (err) {
                process.nextTick(function () {
                    self.emit('error', err);
                });
            });

            callback(null, db);
        });
    });

    EventEmitter.call(this);

    this.prepare = function (cb) {
        connect(function (err, db) {
            cb(err, db);
        });
    };

    this.collection = function (name) {
        return new Collection(name, self);
    };

    this.ObjectId = mongodb.ObjectID; // backwards compat
};

util.inherits(Database, EventEmitter);

/**
 * Returns a mongo db.
 *
 * @param {!String} connectionString The connection string.
 * @returns {*}
 * @constructor
 */
exports.GetDb = function (connectionString) {
    var strConnection = parseConfig(connectionString);

    return new Database(strConnection);
};

exports.BaseRepo = require('./baseRepository.js');
