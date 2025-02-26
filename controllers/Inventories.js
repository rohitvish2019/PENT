const InventoriesData = require('../models/inventories');
//const PurchaseData = require('../models/purchases')

module.exports.getItemByName = async function(req, res) {
    try {
        let qtyArray = new Array();
        let totalQty = 0
        let avgAlertQty = 0;
        let price = 0;
        let batch = "";
        let item = ""
        let expiry = ""
        let batchToConsider = 0;
        let quantity = req.query.quantity
        let items = await InventoriesData.find({Name:req.query.name, Quantity: {$gt : 0}}).sort({ExpiryDate:1});
        console.log("See items here")
        console.log(items);
        console.log("****************************");
        for(let i=0;i<items.length;i++) {
            totalQty = totalQty + items[i].Quantity
            avgAlertQty = avgAlertQty + items[i].AlertQty
        }
        if(items.length == 1) {
            item = items[0].Name
            expiry = items[0].ExpiryDate
            price = items[0].Price
            batch = items[0].Batch
        } else if (items.length > 1) {
            
            if(items[0].Quantity >= req.query.quantity) {
                console.log("Enough quantity in first batch")
                item = items[0].Name
                expiry = items[0].ExpiryDate
                price = items[0].Price
                batch = items[0].Batch
            } else {
                console.log("calculating quantity in each batch")
                let k = 0
                while(quantity > 0 && k < items.length) {
                    console.log("Quantity is "+quantity);
                    if(quantity >= items[k].Quantity) {
                        qtyArray.push(items[k].Quantity);
                    } else {
                        qtyArray.push(quantity);
                    }
                    console.log("now deducting "+ items[k].Quantity)
                    quantity = quantity - items[k].Quantity
                    k++;
                }
                console.log(qtyArray);
                batchToConsider = items[getMaxIndex(qtyArray)];
                console.log("Batch is "+ batchToConsider);
                expiry = batchToConsider.ExpiryDate
                price = batchToConsider.Price
                batch = batchToConsider.Batch

            }
            item = items[0].Name
        } else { //length 0, no items found
            //no action needed
        }
        avgAlertQty = parseInt(avgAlertQty/items.length);
        return res.status(200).json({
            item,
            expiry,
            totalQty,
            avgAlertQty,
            price,
            batch
        })
    } catch (err) {
        console.log(err);
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


function getMaxIndex(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error("Input must be a non-empty array of integers");
    }
    
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[maxIndex]) {
            maxIndex = i;
        }
    }
    return maxIndex;
}