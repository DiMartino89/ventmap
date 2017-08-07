var config = require('config.json');
var express = require('express');
var router = express.Router();
var eventService = require('services/event.service');

// routes
router.post('/create', create);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.get('/', getAll);
router.get('/current', getCurrent);

module.exports = router;

function create(req, res) {
    eventService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    eventService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    eventService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    eventService.getAll()
        .then(function (events) {
            res.send(events);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    eventService.getById(req.params._id)
        .then(function (event) {
            if (event) {
                res.send(event);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}