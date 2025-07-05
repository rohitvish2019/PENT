const express = require('express');
const Router = express.Router();
const prefController = require('../controllers/prefrences');
const passport = require('../configs/passport-local-strategy')
Router.post('/save', passport.checkAuthentication, prefController.addPrefrences);
Router.post('/find', passport.checkAuthentication, prefController.findPrefrences)
module.exports = Router;