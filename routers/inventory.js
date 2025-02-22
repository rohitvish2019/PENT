const express = require('express');
const Router = express.Router();
const passport = require('../configs/passport-local-strategy')
const InventoryController = require('../controllers/Inventories');
Router.get('/getItemByName', passport.checkAuthentication, InventoryController.getItemByName);
Router.get('/getAll/available' , passport.checkAuthentication , InventoryController.getAllItems);
module.exports = Router