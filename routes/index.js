const express = require('express');
const controller = require('../controller/controller');

const router = express.Router();




/* GET home page. */
router.get('/', controller.checkSession, controller.renderLoginPage);

router.post('/homelogin',controller.loginUser);

//registration page
router.route('/register')
  .get(controller.checkSession, controller.renderRegisterPage);
  router.post('/home',controller.createUser);

router.get('/adminhome', controller.adminRender);

router.get('/logout',controller.userLogOut);

router.get('/home', controller.renderHomePage);

router.route('/addUser')
.get(controller.checkAdmin,controller.renderaddUser)
.post(controller.checkAdmin,controller.addUser);

router.get('/updateUser/:id',controller.checkAdmin,controller.renderUpdateUser);
router.post('/updateUser/:id',controller.checkAdmin,controller.updateUser);

router.get('/deleteUser/:id', controller.checkAdmin, controller.deleteUser);
module.exports = router;
