var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/ventmap", { native_parser: true });
db.bind('events');

var service = {};

service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;
service.getById = getById;

module.exports = service;

function create(eventParam) {
    var deferred = Q.defer();
    createEvent();

    function createEvent() {
        var event = _.omit(eventParam, '');
        db.events.insert(event, function (err, doc) {
            var id = doc["ops"][0]["_id"];
            event._id = id;
            if (err) { deferred.reject(err.name + ': ' + err.message); }
			deferred.resolve(_.omit(event, ''));
        });
    }

    return deferred.promise;
}

function update(_id, eventParam) {
    var deferred = Q.defer();
	if(eventParam["_id"]) {
		delete eventParam["_id"];
	}
	
	updateEvent();

    function updateEvent() {		
        db.events.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: eventParam },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.events.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.events.find().toArray(function (err, events) {
        if (err) deferred.reject(err.name + ': ' + err.message);
		
        events = _.map(events, function (event) {
            return _.omit(event, '');
        });

        deferred.resolve(events);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.events.findById(_id, function (err, event) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (event) {
            deferred.resolve(_.omit(event, ''));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}