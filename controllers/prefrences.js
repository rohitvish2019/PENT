const Prefrences = require('../models/prefrences')
module.exports.addPrefrences = async function(req, res){
    try{
        let item = null;
        if(req.body.usedFor.toString().length == 0) {
            item = await Prefrences.find({
                Type:req.body.type,
                Value:req.body.value,
                UsedFor:{ $in : ["Other","All"] }
            });
            if(item && item.length > 0){
                console.log("Item found");
                console.log(item)
            } else {
                await Prefrences.create({
                    Type:req.body.type,
                    Value:req.body.value,
                    UsedFor:"Other"
                });
            }
            return res.status(200).json({
                message :'Record added'
            })
        } else {
            let itemsReceived = req.body.usedFor.toString().split(',');
            let count = 0;
            let item = null
            if(req.body.type == 'complaint'){
                for(let i=0;i<itemsReceived.length;i++){
                    item = await Prefrences.findOne({Type:req.body.type, Value:req.body.value, UsedFor:itemsReceived[i]});
                    if(item) {
                        //
                    } else {
                        if(itemsReceived[i].length > 1) {
                            await Prefrences.create({
                                Type:req.body.type,
                                Value:req.body.value,
                                UsedFor:itemsReceived[i]
                            });
                            count++
                        }
                    }
                }
            } else {
                item = await Prefrences.findOne({Type:req.body.type, Value:req.body.value});
                if(item) {
                    //
                } else {
                    await Prefrences.create({
                        Type:req.body.type,
                        Value:req.body.value,
                        UsedFor:'All'
                    });
                }
            }
            return res.status(200).json({
                message :'Record added'
            })
        }
        
    }catch(err) {
        console.log(err);
        return res.status(500).json({
            message :'Error adding record'
        })
    }
}

module.exports.findPrefrences = async function(req, res){
    try{
        let itemsToFind = "";
        let findAll = false;
        let prefrences = null;
        if(req.body.usedFor.toString().includes('All')){
            findAll = true
        }

        if(findAll) {
            prefrences = await Prefrences.find({Type:'complaint'});
        } else {
            itemsToFind = req.body.usedFor.toString().split(',');
            prefrences = await Prefrences.find({
                UsedFor: {$in : itemsToFind}, Type:'complaint'
            })
        }   
        

        return res.status(200).json({
            prefrences
        })
        
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message :'Unable to fetch prefrences'
        })
    }
}