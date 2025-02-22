const mongoose = require('mongoose');
const Inventories = new mongoose.Schema({
    Name:String,
    ExpiryDate:String,
    Category:String,
    Batch:String,
    Quantity : Number,
    AlertQty : Number,
    ActiveBatch: Boolean,
    Price : Number,
    
},
{
    timestamps:true
});

const Inventory = mongoose.model('Inventory', Inventories);
module.exports = Inventory;