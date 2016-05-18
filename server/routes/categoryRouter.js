var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var db = require('../models/budget-db');

var Verify = require('./verify');

var categoryRouter = express.Router();
categoryRouter.use(bodyParser.json());

categoryRouter.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        db.categoryModel.find({}, function(err, results) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            return res.json(results);
        });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        console.log("creating category..");
        if (req.body.name === undefined) {
            return res.json(400);
        }

        var category = new db.categoryModel();
        category.name = req.body.name;
        category.description = req.body.description;

        category.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            return res.json(category);
        });
    })

categoryRouter.route('/:categoryId')

    .delete(function (req, res, next) {
        if (req.params.categoryId === undefined) {
            return res.json(400);
        }

        var categoryId = req.params.categoryId;

        db.categoryModel.findOne({_id: categoryId}, function(err, result) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            result.remove();
            return res.send(200);
        });
    });

module.exports = categoryRouter;