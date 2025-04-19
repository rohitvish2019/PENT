const mongoose = require('mongoose');
const Operations = new mongoose.Schema({
    Name:{
        type:String
    }
},
{
    timestamps:true
});

const operations = mongoose.model('Operations', Operations);
module.exports = operations;