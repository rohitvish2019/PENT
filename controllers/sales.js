const ServicesData = require('../models/servicesAndCharges');
const SalesData = require('../models/sales')
const PatientData = require('../models/patients');
const Tracker = require('../models/tracker');
const Visits = require('../models/visits');
const Inventories = require('../models/inventories')
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./configs/hospital.properties');
const HospitalName = properties.get('HospitalName');
const HospitalAddress2 = properties.get('HospitalAddress2');
const HospitalAddress = properties.get('HospitalAddress');
const logo = properties.get('logoPath');
const regNo = properties.get('HospitalRegNo');
const hospitalMobile = properties.get('HospitalMobile');
const doctorMobile = properties.get('DoctorMobile');
const InventoriesController = require('../controllers/Inventories');
module.exports.salesHistoryHome = function(req, res){
    try{
        return res.render('salesHistory',{user:req.user,HospitalName});
    }catch(err){
        return res.render('Error_500')
    }
    
}

module.exports.newPathologyBill = async function(req, res){
    try{
        let services = await ServicesData.find({}, 'Name');
        return res.render('pathologyBill', {services, user:req.user,HospitalName})
    }catch(err){
        return res.render('Error_500')
    }
}

module.exports.newUltrasoundBill = async function(req, res){
    try{
        let services = await ServicesData.find({Type:'Ultrasound'}, 'Name');
        return res.render('ultrasoundBilling', {services, user:req.user,HospitalName})
    }catch(err){
        return res.render('Error_500')
    }
}

module.exports.newOtherBill = async function(req, res){
    try{
        let services = await ServicesData.find({}, 'Name');
        return res.render('otherBills', {services, user:req.user,HospitalName})
    }catch(err){
        return res.render('Error_500')
    }
}

module.exports.newMedicalBill = async function(req, res){
    try{
        let stock = await Inventories.find({}, 'Name').distinct('Name');
        console.log(stock)
        return res.render('medicalBill', {stock, user:req.user,HospitalName})
    }catch(err){
        return res.render('Error_500')
    }
}

module.exports.addSales = async function(req, res){
    //Items should be an array and each value of array will be in below format
    //ItemName$Quantity$Price$Notes
    try{
        let Name, Age, Address, Mobile, Id, Gender, Patient, IdProof,Husband
        if(req.body.id){
            console.log('Getting by id')
            let patient = await PatientData.findOne({Id:req.body.id});
            if(!patient || patient == null){
                return res.status(400).json({
                    message:'Invalid patient details'
                })
            }
            Name = patient.Name,
            Age = patient.Age,
            Address = patient.Address,
            Mobile = patient.Mobile,
            Id = patient.Id
            Gender = patient.Gender
            Patient = patient._id,
            IdProof = patient.IdProof,
            Husband = patient.Husband
        }else{
            Name = req.body.patient.Name,
            Age = req.body.patient.Age,
            Address = req.body.patient.Address,
            Mobile = req.body.patient.Mobile,
            Gender = req.body.patient.Gender,
            IdProof = req.body.patient.IdProof,
            Husband = req.body.patient.Husband
            Id = null,
            Patient = null
        }

        let tracker = await Tracker.findOne({});
        
        let day = new Date().getDate().toString().padStart(2,'0')
        let month = +new Date().getMonth()
        let year = new Date().getFullYear()
        let date = year +'-'+ (month+1).toString().padStart(2,'0') +'-'+ day; 
        let rptType = 'NA'
        let BillNo
        if(req.body.Type == 'Medical') {
            rptType = 'MED'
            BillNo = tracker.MedBillNumber + 1
            await tracker.updateOne({MedBillNumber:BillNo});
        }
        else if(req.body.Type == 'Ultrasound'){
            rptType = 'USG'
            BillNo = tracker.USGBillNumber + 1
            await tracker.updateOne({USGBillNumber:BillNo});
        }else if(req.body.Type == 'Pathology'){
            rptType = 'PATH'
            BillNo = tracker.PathologyBillNo + 1
            await tracker.updateOne({PathologyBillNo:BillNo});
        }else if(req.body.Type == 'Other'){
            rptType = 'PENT'
            BillNo = tracker.OtherBillNumber + 1
            await tracker.updateOne({OtherBillNumber:BillNo});
        }
        try{
            let Items = req.body.Items;
            for(let i=0;i<Items.length;i++) {
                let itemSplitted = Items[i].split("$");
                let itemName = itemSplitted[0];
                let itemQty = parseInt(itemSplitted[1]);
                let itemsFromDB = await Inventories.find({Name:itemName, Quantity:{$gt : 0}}).sort({ExpiryDate : 1});
                if(itemsFromDB.length == 1) {
                    if(itemsFromDB[0].Quantity < parseInt(itemQty)) {
                        //return error
                        return res.status(400).json({
                            message :'Inavlid quantity sent from user'
                        })
                    } else {
                        let qtyAfterDeduction = itemsFromDB[0].Quantity - parseInt(itemQty);
                        await Inventories.findOneAndUpdate({Name:itemName, Quantity : {$gt : 0}}, {$set : {Quantity : qtyAfterDeduction}})
                    }
                } else if (itemsFromDB.length > 1) {
                    let len = 0
                    let qty = itemQty
                    while(len < itemsFromDB.length && qty > 0) {
                        console.log("Now qty is "+ qty)
                        if(qty <= itemsFromDB[len].Quantity) {
                            console.log("Enough for batch "+ itemsFromDB[len].Batch + " :: " +itemsFromDB[len].Quantity)
                            itemsFromDB[len].Quantity = itemsFromDB[len].Quantity - qty;
                            qty = 0
                        } else {
                            console.log("not enough for batch "+ itemsFromDB[len].Batch +" :: " +itemsFromDB[len].Quantity)
                            qty = qty - parseInt(itemsFromDB[len].Quantity);
                            itemsFromDB[len].Quantity = 0;
                            console.log("Deducting required qty "+itemsFromDB[len].Quantity)
                            console.log("Setting new qty "+ qty)
                        }
                        await itemsFromDB[len].save();
                        len++;
                    }
                }
            }
        }catch(err){
            console.log(err)
            return res.status(500).json({
                message:'Error deducting stock'
            })
        }
        let sale = await SalesData.create({
            Patient:Id,
            Name:Name,
            Age:Age,
            Mobile:Mobile,
            Gender:Gender,
            Husband:Husband,
            Address:Address,
            PatiendID:Id,
            type:req.body.Type,
            ReportNo:rptType+BillNo,
            Patient:Patient,
            UserName:req.user.Name,
            User:req.user._id,
            BillDate:date,
            Total:req.body.Total,
            Items:req.body.Items,
            PaymentType:req.body.paymentMode,
            IdProof :IdProof,
            Doctor:req.body.patient.Doctor,
            OnlinePaid:req.body.onlinePayment,
            CashPaid:req.body.cashPayment
        })
        
    return res.status(200).json({
        message:'Bill created successfully',
        Bill_id : sale._id
    })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:'Internal Server Error : Unable to add new bill'
        })
    }
}


module.exports.getBillById = async function(req, res){
    let bill 
    try{
        console.log(req.params.id);
        bill = await SalesData.findOne({_id:req.params.id});
        
        if(bill && req.xhr){
            return res.status(200).json({
                bill
            })
        }else if(bill && !req.xhr){
            return res.render('billTemplate',{bill, user:req.user,HospitalName,HospitalAddress,HospitalAddress2,regNo,logo,hospitalMobile, doctorMobile, docName:'Cash Memo'})
        }
        else if(req.xhr && (!bill || bill == null)){
            return res.status(404).json({
                message:'No bill found'
            })
        }
        else{
            return res.render('Error_404')
        } 
    }catch(err){
        console.log(err)
        return res.render('Error_500')
    }
}



module.exports.getBillsByDate = async function(req, res){
    try{
        //date to be fixed to handle all date formats
        let BillType = req.query.BillType;
        let date = req.query.selectedDate;
        let Doctor = req.query.Doctor;
        let billsList;
        if(BillType == 'all'){
            if(Doctor == 'all'){
                billsList = await SalesData.find({BillDate:date,isCancelled:false, isValid:true});
            }else{
                billsList = await SalesData.find({BillDate:date,isCancelled:false, isValid:true, Doctor:Doctor});
            }
            
        }else{
            if(Doctor == 'all'){
                billsList = await SalesData.find({BillDate:date,type:req.query.BillType, isCancelled:false, isValid:true});
            }else{
                billsList = await SalesData.find({BillDate:date,type:req.query.BillType, isCancelled:false, isValid:true, Doctor:Doctor});
            }
            
        }
        return res.status(200).json({
            message:'Bills fetched',
            billsList
        })
       
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:'Internal Server Error : unable to find bills on specific date'
        })
    }
}
/*
function addOneDay(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Input must be a valid Date object.");
    }

    // Create a new Date object to avoid modifying the original
    const newDate = new Date(date);
    
    // Add one day
    newDate.setDate(newDate.getDate() + 1);

    // Check if the date is still within JavaScript's supported range
    if (Math.abs(newDate.getTime()) > 8.64e15) {
        throw new Error("Resulting date is out of range for JavaScript Date object.");
    }

    return newDate;
}
*/

module.exports.getBillsByDateRange = async function(req, res){
    try{
        let BillType = req.query.BillType;
        let Doctor = req.query.Doctor;
        let billsList;
        if(BillType == 'all'){
            if(Doctor == 'all'){
                billsList = await SalesData.find({
                    $and: [
                        {BillDate:{$gte :req.query.startDate}},
                        {BillDate: {$lte : req.query.endDate}},
                        {isCancelled:false, isValid:true}
                    ]
                })
            }else{
                billsList = await SalesData.find({
                    $and: [
                        {BillDate:{$gte :req.query.startDate}},
                        {BillDate: {$lte : req.query.endDate}},
                        {isCancelled:false, isValid:true, Doctor:req.query.Doctor}
                    ]
                })
            }
            
        }else{
            if(Doctor == 'all'){
                billsList = await SalesData.find({
                    $and: [
                        {BillDate:{$gte :req.query.startDate}},
                        {BillDate: {$lte : req.query.endDate}},
                        {type:req.query.BillType,isCancelled:false, isValid:true}
                    ]
                })
            }else{
                billsList = await SalesData.find({
                    $and: [
                        {BillDate:{$gte :req.query.startDate}},
                        {BillDate: {$lte : req.query.endDate}},
                        {type:req.query.BillType,isCancelled:false, isValid:true, Doctor:req.query.Doctor}
                    ]
                })
            }
            
        }
        
        return res.status(200).json({
            message:'Bills fetched',
            billsList
        })
        
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:'Internal Server Error : unable to find bills on specific dates'
        })
    }
}


module.exports.cancelSale = async function(req, res){
    try{
        if(req.user.Role == 'Admin' || req.user.Role == 'Doctor'){
            let sale = await SalesData.findById(req.body.saleId);
            let appointment = await Visits.findOne({SaleId:sale._id},'isCancelled');
            if(sale.type == 'IPDAdvance'){
                let pattern = sale.Total + "\\$" + sale.BillDate;
                await Visits.findByIdAndUpdate(sale.Visit, {$pull : { advancedPayments : { $regex : pattern}}});
            }
            await sale.updateOne({isCancelled:true})
            if(appointment){
                if(appointment.VisitData && appointment.VisitData.complaint.length > 0){
                    return res.status(424).json({
                        message:'Appointment already completed'
                    })
                }else{
                    await appointment.updateOne({isCancelled:true})
                }
            }
            return res.status(200).json({
                message:'Sales cancelled'
            })
        }else{
            return res.status(403).json({
                message:'Unauthorized action'
            })
        }
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:'Error cancelling sales'
        })
    }
}


module.exports.validateBill = async function(req , res){
    try{
        let bill = await SalesData.findOne({ReportNo:req.query.billNumber, Name:req.query.Name, isValid:true, isCancelled:false});
        console.log(bill)
        if(bill){
            return res.status(200).json({
                isValid : true
            })
        }else{
            return res.status(200).json({
                isValid :false
            })
        }
    }catch(err){
        return res.status(500).json({
            message:'Unable to validate bill'
        })
    }
}