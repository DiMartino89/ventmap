var config = require('config.json');
var express = require('express');
var router = express.Router();
var reviewService = require('services/review.service');

// routes
router.post('/create', create);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.get('/', getAll);
router.get('/current', getCurrent);

module.exports = router;

function create(req, res) {
    reviewService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    reviewService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    reviewService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    reviewService.getAll()
        .then(function (reviews) {
            res.send(reviews);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    reviewService.getById(req.params._id)
        .then(function (review) {
            if (review) {
                res.send(review);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}