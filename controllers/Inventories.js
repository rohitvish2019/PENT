const InventoriesData = require('../models/inventories');
//const PurchaseData = require('../models/purchases')

module.exports.getItemByName = async function(req, res) {
    try {
        console.log(req.query)
        let items = await InventoriesData.find({Name:req.query.name});
        console.log(items)
        let med = new Object();
        let count = 0;
        let alertQty = 0
        for(let i=0;i<items.length;i++) {
            count = count + items[i].Quantity;
            alertQty = alertQty + items[i].AlertQty
        }
        alertQty = parseInt(alertQty/items.length)
        return res.status(200).json({
            med,
            qty:count,
            alertQty
        })
    } catch (err) {
        return res.status(500).json({
            message : "Unable to find item"
        })
    }
}

