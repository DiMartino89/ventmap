var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/ventmap", { native_parser: true });
db.bind('reviews');

var service = {};

service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;
service.getById = getById;

module.exports = service;

function create(reviewParam) {
    var deferred = Q.defer();
    createReview();

    function createReview() {
        var review = _.omit(reviewParam, '');
        db.reviews.insert(review, function (err, doc) {
            var id = doc["ops"][0]["_id"];
            review._id = id;
            if (err) { deferred.reject(err.name + ': ' + err.message); }
			deferred.resolve(_.omit(review, ''));
        });
    }

    return deferred.promise;
}

function update(_id, reviewParam) {
    var deferred = Q.defer();
	if(reviewParam["_id"]) {
		delete reviewParam["_id"];
	}
	
	updateReview();

    function updateReview() {		
        db.reviews.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: reviewParam },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.reviews.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.reviews.find().toArray(function (err, reviews) {
        if (err) deferred.reject(err.name + ': ' + err.message);
		
        reviews = _.map(reviews, function (review) {
            return _.omit(review, '');
        });

        deferred.resolve(reviews);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.reviews.findById(_id, function (err, review) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (review) {
            deferred.resolve(_.omit(review, ''));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}