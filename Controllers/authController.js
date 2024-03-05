const User= require('../Models/userModel');
const bcrypt=require('bcrypt');
const express = require("express");
const session = require("express-session");
const flash = require("express-flash");


const app = express();

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  }));
  

app.use(flash());

exports.getRegisterPage=((req,res)=>{
    console.log("inside get register page");
    res.render("register");
    
})

exports.registerUser= async (req,res)=>{
try{
    console.log("post register page 1");
    const {email, password, username}=req.body;
    console.log("post register page 2",email);
    const existingUser=await User.findOne({email:email});

    if(existingUser){
        console.log("post register page 3");
        // return res.status(400).send("User already existed");
        console.log(res.status);
        return res.redirect("login");
       
    }  else{
        console.log("post register page 4",);

    // const newUser= new User ({username, email, password});
    // await newUser.save();
        const hashedPassword= await bcrypt.hash(req.body.password,6);
    const data={
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword

    }
    await User.insertMany([data]);

    console.log("post register page 5");
    return res.redirect("login");
    }

}
catch (error){
    console.error("Error registering user", error);
    res.status(500).send("Internal server error")
}
};
// registerUser();

exports.getLoginPage = (req, res) => {
    console.log("inside getLoginPage");
    if(req.session.isAuth){
        return res.render("dashboard",{user:req.session.user})
    }
    else{
        const errMessage=req.flash("error");
        res.render("login", { errorMessage:errMessage });
    }
};


exports.loginUser=async(req,res)=>{
try{
    const {email,password}=req.body;

    const user= await User.findOne({email});

    if(!User || !(await bcrypt.compare(password,user.password))){
      
        req.flash("error","Invalid email or password");
        return res.redirect("register")
    }

    else{
        console.log("session creation for user",user.email);
    req.session.id=user._id;
    req.session.user=user.email;
    req.session.isAuth=true;
    // res.status(200).json({message:"login successful", user:{username:user.username, isAdmin:user.isAdmin}});
    console.log("session created for user",email);

      return res.render("dashboard",{userEmail:req.session.user});   
    }
}

catch(error){
console.error("Error logging in user", error);

req.flash("error", "Internal server error");
return res.redirect("login");
}
};



exports.getDashboardPage=((req,res)=>{
    res.render("dashboard");
})


exports.logoutUser=((req,res)=>{
    console.log("Inside logout function");
    req.session.isAuth=false;
    console.log("session destroyed");
    res.redirect("login")
});

exports.getAdminLoginPage=((req,res)=>{
    const errMessage=req.flash("error");
    res.render("adminLogin",{errorMessage:errMessage});
})

exports.loginAdmin=(async (req,res)=>{
    const {email,password}=req.body;
    try{
        console.log("Inside loginAdmin");
        const user= await User.findOne({email:email,isAdmin:true});
        if(user && await bcrypt.compare(password,user.password)){
            req.session.id=user._id;
            req.session.admin=user.email;
            req.session.username=user.username;
            req.session.isAdAuth=true;
            console.log("admin session created");
            return res.redirect("adminDashboard");

        }else{
            req.flash("You are not an Admin");
            console.log("inside else statement not an admin");
            return res.redirect("adminLogin");
        }
    }
    catch(error){
        console.error("Error",error);
        req.flash("Some internal error");
            return res.redirect("adminLogin")
    }
});

exports.getAdminDashboard = async (req, res) => {

    try {
        console.log("Inside getAdminDashboard");
        if (req.session.isAdAuth && req.session.admin) {
            const userSuccess = req.flash('userSuccess') || [];
            const userDeleted = req.flash('userDeleted') || [];
            console.log("Fetching users...");
            const users = await User.find().exec();
            console.log("Fetched users");
            return res.render("adminDashboard", { userSuccess, userDeleted, users });
        } else {
            console.log("User is not authenticated as admin. Redirecting to adminLogin...");
            return res.redirect("adminLogin");
        }
    } catch (error) {
        console.error("Error thrown inside admin dashboard", error);
        res.redirect("adminLogin");
    }
}


exports.adminDashboard=(async (req,res)=>{
    if(req.session.isAdAuth){
        console.log("Inside adminDashboard POST 1");
        const name=req.body.search;
        const data= await User.find({name:{$regex: new RegExp(name, "i")}});
        if (data.length===0){
            req.flash('userDeleted', "No users found for the search");
        } else{
            req.flash('userSuccess', "Search results retrieved successfuly")
        }
        console.log("Inside adminDashboard POST 2");
        res.render("adminDashboard",{
            users:data,
            userSuccess:req.flash('userSuccess'),
            userDeleted:req.flash('userDeleted')
        });
    } else{
        res.redirect("adminLogin");
    }
});

exports.addUser=((req,res)=>{

})

exports.logoutAdmin=((req,res)=>{
    console.log("Inside logoutAdmin");
    req.session.idAdAuth=false;
    return res.redirect("adminLogin");
    
})
// module.exports={
//     registerUser,
//     getRegisterPage,
//     loginUser,
//     logoutUser
// };