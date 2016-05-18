var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var db = require('../models/budget-db');
var user = require('../models/user');

var Verify = require('./verify');

var budgetRouter = express.Router();
budgetRouter.use(bodyParser.json());


budgetRouter.route('/')
    .get(function (req, res, next) {
        /*db.find(req.query)
            .populate('records.categoryId')
            .exec(function (err, budget) {
                if (err) next(err);
                res.json(budget);
            });*/
        db.budgetModel.find(req.query, function(err, results) {
            if (err) {
                console.log(err);
                return res.send(400);
            }
            return res.json(results);
        });
    })

    .post(function (req, res, next) {

        if (req.body.name === undefined || req.body.currency === undefined) {
            return res.json(400, {message:"Bad Data"});
        }


        var budget 		= new db.budgetModel();
        budget.name 		= req.body.name;
        budget.description 	= req.body.description;
        budget.currency 	= req.body.currency;
        budget.balance 	= 0;
        budget.username    = req.body.username;

        console.log(budget);

        budget.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(400);
            }
            return res.json(200, budget);
        });
    })



budgetRouter.route('/:budgetId')
    .get(function (req, res, next) {
        if (req.params.budgetId === undefined) {
            return res.json(400, {message:"Bad Data"});
        }

        var budgetId = req.params.budgetId;

        db.budgetModel.findOne({_id: budgetId}).lean().exec(function(err, result) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            if (result === null) {
                return res.json(400);
            }

            db.recordModel.find({budget_id: budgetId}, function(err, records) {
                if (err) {
                    console.log(err);
                    return res.send(400);
                }

                result.records = records;

                return res.json(result);
            });

        });
    })


    .delete(function (req, res, next) {
        if (req.params.budgetId === undefined) {
            return res.json(400, {message:"Bad Data"});
        }

        var budgetId = req.params.budgetId;

        db.budgetModel.findOne({_id: budgetId}, function(err, result) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            db.recordModel.find({budget_id: result._id}, function(err, records) {
                if (err) {
                    console.log(err);
                    return res.send(400);
                }
                records.forEach(function(record) {
                    record.remove();
                })

                result.remove();
                return res.send(200);
            });
        });
    });

budgetRouter.route('/:budgetId/records')

    .post(function (req, res, next) {
        if (req.body.amount === undefined || isNaN(Number(req.body.amount)) || req.body.category === undefined
            || req.body.is_expense === undefined || req.params.budgetId === undefined) {
            return res.json(400, {message:"Bad Data"});
        }

        var budgetId = req.params.budgetId;

        var record = new db.recordModel();
        record.budget_id = budgetId;
        record.amount = req.body.amount;
        record.category	= req.body.category;
        record.description = req.body.description;
        record.is_expense = req.body.is_expense;

        record.save(function(err) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            if (record.is_expense) {
                db.budgetModel.update({_id:budgetId}, { $inc: { balance: -record.amount } }, function(err, nbRows, raw) {
                    return res.json(200, record);
                });
            }
            else {
                db.budgetModel.update({_id:budgetId}, { $inc: { balance: record.amount } }, function(err, nbRows, raw) {
                    return res.json(200, record);
                });
            }
        });
    });

budgetRouter.route('/:budgetId/records/:recordId')

    .delete(function (req, res, next) {
        if (req.params.budgetId === undefined || req.params.recordId === undefined) {
            return res.json(400, {message:"Bad Data"});
        }

        var recordId = req.params.recordId;
        var budgetId = req.params.budgetId;

        db.recordModel.findOne({_id: recordId, budget_id: budgetId}, function(err, record) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            if (record.is_expense) {
                db.budgetModel.update({_id:budgetId}, { $inc: { balance: record.amount } }, function(err, nbRows, raw) {
                    record.remove();
                    return res.json(200, record);
                });
            }
            else {
                db.budgetModel.update({_id:budgetId}, { $inc: { balance: -record.amount } }, function(err, nbRows, raw) {
                    record.remove();
                    return res.json(200, record);
                });
            }
        });
    });


module.exports = budgetRouter;