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

module.exports.getAllItems = async function (req, res) {
    try {
        let items = await InventoriesData.aggregate([
            {
                $group: {
                    _id: "$Name",  // Group by name
                    TotalQuantity: { $sum: "$Quantity" },  // Sum the quantities
                    Category: { $first: "$Category" }, // Pick first category (assuming consistent category for same name)
                    Batch: { $addToSet: "$Batch" }, // Pick first batch (modify if needed)
                    ExpiryDate: { $first: "$ExpiryDate" }, // Pick first expiry date
                    Price: { $first: "$Price" }, // Pick first price
                    Quantity : { $min : 0},
                    AlertQty : { $avg : "$AlertQty"}

                }
            },
            {
                $match: { TotalQuantity: { $gt: 0 } }  // Filter where quantity > 0
            },
            {
                $project: {
                    _id: 0,
                    Name: "$_id",
                    TotalQuantity: 1,
                    Category: 1,
                    Batch: 1,
                    ExpiryDate: 1,
                    Price: 1,
                    AlertQty:1
                }
            }
        ]);
        return res.status(200).json({
            items
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message :'Error fetching inventories'
        })
    }
}
