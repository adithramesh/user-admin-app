const express=require('express');
const router=express.Router();
const authControllers= require("../Controllers/authController")

router.get("/adminLogin",authControllers.getAdminLoginPage);

router.post("/adminLogin", authControllers.loginAdmin);

router.get("/adminDashboard",authControllers.getAdminDashboard);

router.post("/adminDashboard",authControllers.adminDashboard);

router.get("/logoutAdmin",authControllers.logoutAdmin);

router.get("/addUserRender", authControllers.addUserRender)

router.post("/addUser", authControllers.addUser)

router.get("/update/:username",authControllers.updateUserRender)

router.post("/update/:id",authControllers.updateUser)

router.get("/delete/:id",authControllers.deleteUser)


module.exports=router;
