const mongoose = require('mongoose');
const Prefrences = new mongoose.Schema({
    Type:String,
    Value:String,
    UsedFor:String
},
{
    timestamps:true
});

const Prefrence = mongoose.model('Prefrence', Prefrences);
module.exports = Prefrence;