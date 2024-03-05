const express=require('express');
const router=express.Router();
const authControllers= require("../Controllers/authController")

router.get("/adminLogin",authControllers.getAdminLoginPage);

router.post("/adminLogin", authControllers.loginAdmin);

router.get("/adminDashboard",authControllers.getAdminDashboard);

router.post("/adminDashboard",authControllers.adminDashboard);

router.get("/logoutAdmin",authControllers.logoutAdmin);

module.exports=router;
