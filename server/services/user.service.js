var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/ventmap", { native_parser: true });
db.bind('users');

var service = {};

service.authenticate = authenticate;
service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;
service.getById = getById;

module.exports = service;

function authenticate(email, password) {
    var deferred = Q.defer();

    db.users.findOne({ email: email }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
			deferred.resolve({
                _id: user._id,
                enabled: user.enabled,
                token: jwt.sign({ sub: user._id }, config.secret)
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findOne({ email: userParam.email }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
		
        if (user) {
            // email already exists
            deferred.reject('Email "' + userParam.email + '" is already taken');
        } else {
            createUser();
        }
    });

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(user, function (err, doc) {
            if (err) { deferred.reject(err.name + ': ' + err.message); }
			var id = doc["ops"][0]["_id"];
			user._id = id;
			deferred.resolve(_.omit(user, 'hash'));
        });
    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();
	if(userParam["_id"]) {
		delete userParam["_id"];
	}
	if(userParam["email"]) {
		delete userParam["email"];
	}
	
	updateUser();

    function updateUser() {		
        db.users.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: userParam },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    db.users.findOne({ _id: mongo.helper.toObjectID(_id) }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}