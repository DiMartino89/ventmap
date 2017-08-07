var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/ventmap", { native_parser: true });
db.bind('locations');

var service = {};

service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;
service.getById = getById;

module.exports = service;

function create(locationParam) {
    var deferred = Q.defer();
    createLocation();

    function createLocation() {
        var location = _.omit(locationParam, '');
        db.locations.insert(location, function (err, doc) {
            var id = doc["ops"][0]["_id"];
            location._id = id;
            if (err) { deferred.reject(err.name + ': ' + err.message); }
			deferred.resolve(_.omit(location, ''));
        });
    }

    return deferred.promise;
}

function update(_id, locationParam) {
    var deferred = Q.defer();
	if(locationParam["_id"]) {
		delete locationParam["_id"];
	}
	
	updateLocation();

    function updateLocation() {		
        db.locations.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: locationParam },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.locations.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.locations.find().toArray(function (err, locations) {
        if (err) deferred.reject(err.name + ': ' + err.message);
		
        locations = _.map(locations, function (location) {
            return _.omit(location, '');
        });

        deferred.resolve(locations);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.locations.findById(_id, function (err, location) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (location) {
            deferred.resolve(_.omit(location, ''));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}