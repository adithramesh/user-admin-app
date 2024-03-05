const express=require('express');
const router=express.Router();
const authControllers=require("../Controllers/authController")


router.get("/register", authControllers.getRegisterPage);

router.post("/register", authControllers.registerUser);

router.get("/login", authControllers.getLoginPage);

router.post("/login",authControllers.loginUser);
    
router.get("/dashboard", authControllers.getDashboardPage);

router.post("/dashboard", authControllers.getDashboardPage);

router.post("/logout",authControllers.logoutUser);


// router.get("/signup",(req,res)=>{
//     res.send("Users sign up page")
// });

// router.get("/home", (req,res)=>{
//     res.send("Users home page")
// });

module.exports=router;