// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recordSchema = new Schema({
    budget_id: { type: Schema.ObjectId, ref: 'Budget', required: true },
    amount: { type: Number, required: true },
    is_expense: { type: Boolean, default: false},
    description: { type: String, default: '', required: false },
    category: { type: String, required: true }
}, {
    timestamps: true
});

var budgetSchema = new Schema({
    username: { type: String, ref: 'User', required: false },
    name:  {type: String, required: true },
    description: { type: String, required: false},
    balance: { type: Number, required: false },
    currency: { type: String, required: true }
}, {
    timestamps: true
});

var categorySchema = new Schema({
    name:  { type: String, required: true },
    description: { type: String, default: '' }
}, {
    timestamps: true
});


var categoryModel  = mongoose.model('Category', categorySchema);
var budgetModel    = mongoose.model('Budget', budgetSchema);
var recordModel    = mongoose.model('Record', recordSchema);

exports.budgetModel = budgetModel;
exports.categoryModel = categoryModel;
exports.recordModel = recordModel;

