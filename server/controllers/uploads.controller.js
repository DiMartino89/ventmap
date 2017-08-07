var express = require('express');
var multer = require('multer');
var fs = require('fs');
var cors = require("cors");
var crypto = require("crypto");
var mime = require("mime");
var path = require('path');
var router = express.Router();

var DIR = '../client/uploads/';

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
		let type = req.params.type;
		let path = DIR + '${type}';
		fs.mkdirsSync(path);
        cb(null, path)
    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            var type = file.originalname.split('.')[1];
            cb(null, raw.toString('hex') + Date.now() + '.' + type);
        });
    }
});

var upload = multer({ storage: storage });

router.post('/user_avatar', upload.any(), function(req, res, next) {
    res.end(req.files[0].filename);
});

router.post('/user_titleImage', upload.any(), function(req, res, next) {
    res.end(req.files[0].filename);
});

router.post('/user_pictures', upload.any(), function(req, res, next) {
    var images = '';
    for(var i=0; i < req.files.length; i++) {
        images += req.files[i].filename + ',';
    }
    res.end(images);
});

router.post('/event_titleImage', upload.any(), function(req, res, next) {
    console.log(req.files);
    res.end(req.files[0].filename);
});

router.post('/event_pictures', upload.any(), function(req, res, next) {
    var images = '';
    for(var i=0; i < req.files.length; i++) {
        images += req.files[i].filename + ',';
    }
    res.end(images);
});

module.exports = router;