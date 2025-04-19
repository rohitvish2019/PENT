const express = require('express');
const Router = express.Router();
const opsController = require('../controllers/operations');
const passport = require('../configs/passport-local-strategy')
Router.get('/getAll', passport.checkAuthentication, opsController.getAll);
Router.post('/addNew', passport.checkAuthentication, opsController.addOperation)
//Router.delete('/deleteMedicine/:medId', passport.checkAuthentication, medController.deleteMedicine)
module.exports = Router;