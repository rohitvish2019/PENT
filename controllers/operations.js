const Operations = require('../models/operations');
module.exports.addOperation = async function(req, res){
    try{
        await Operations.create({
            Name:req.body.Name
        });
        return res.status(200).json({
            message:'Operation added'
        })
    }catch(err){
        return res.status(500).json({
            message:'Unable to add Operation'
        })
    }
}

module.exports.getAll = async function(req, res){
    try{
        let operationsList = await Operations.find({});
        return res.status(200).json({
            operationsList
        })
    }catch(err){
        return res.status(500).json({
            message:"Unable to get operations list"
        })
    }
}

module.exports.deleteOperation = function(req, res){
    try{

    }catch(err){

    }
}