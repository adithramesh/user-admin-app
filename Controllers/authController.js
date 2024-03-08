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
        console.log(name);
        const data= await User.find({username:{$regex: new RegExp(name, "i")}});     
    //    const data= await User.find({ username: { $regex: /username/i } });
        console.log(data);
        if (data.length===0){
            console.log("inside no user flash 1")
            req.flash('userDeleted', "No users found for the search");
            console.log("inside no user flash 2")
        } else{
            console.log("inside user success flash 1")
            req.flash('userSuccess', "Search results retrieved successfuly")
            console.log("inside user success flash 2")
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

exports.addUserRender=((req,res)=>{
    if(req.session.isAdAuth){
        res.render("addUser");
    }else{
        req.redirect("adminLogin")
    }
})

exports.addUser=(async (req,res)=>{
    try{
        const {name, email, password, confirmPassword}= req.body;
        const user=await User.findOne({email});
        if(!user){
            if(password!==confirmPassword){
                req.flash('passwordError',"Password doesn't match");
                return res.redirect("addUserRender");
            }
            const hashedPassword= await bcrypt.hash(password,10);
            const data={
                username:name,
                email:email,
                password:hashedPassword
            }
            await User.insertMany([data]);
            req.flash('userSuccess',"User added successfully");
            res.redirect("adminDashboard");
        }else{
            req.flash('userExist',"Existing User");
            res.redirect("adminDashboard");
        }
    }catch{
        console.error("Some internal error", error);
        req.flash('emailError',"Error while submitting");
        res.redirect("addUser");

    }

})



exports.logoutAdmin=((req,res)=>{
    console.log("Inside logoutAdmin");
    req.session.idAdAuth=false;
    return res.redirect("adminLogin"); 
})


exports.updateUserRender=(async (req,res)=>{
    if(req.session.isAdAuth){
    try{
        
        console.log("Inside updateUserRender try");
        let username=req.params.username;
        console.log(username);
        const user= await User.findOne({username});
        if(user){
            console.log("Inside if user is fetched");
           return res.render("updateUser",{user})
        }else{
            return res.redirect("/admin/adminDashboard")
        }
   
    }catch(error){
        console.error("Error in fetching user",error);
        return res.status(500).send("Internal Server Error");

    } 
    }else{
        return res.redirect("/admin/adminDashboard")
    }
})

exports.updateUser=(async(req,res)=>{
  if(req.session.isAdAuth){
    try{
        console.log("inside update user submit");
        const id=req.params.id;
        console.log(id);
        const {name,email,isAdmin}=req.body;
        const updatedUser= await User.findOneAndUpdate(
            {_id:id},
            {$set:{
                username:name,
                email:email,
                isAdmin:isAdmin==='true'
            },},
            {new:true}
        );
        console.log(updatedUser);
        if(updatedUser){
            console.log("inside updated user");
            req.flash('userSuccess',"User updated successfully");
            if(req.session.isAdAuth){
            res.redirect("/admin/adminDashboard")
            }
        }else{
            res.redirect("/admin/adminDashboard")
        }

    }catch(error){
        console.error('Error during update',error);
        res.redirect("/admin/adminDashboard")
    }
  }else{
    res.redirect("/admin/adminLogin")
  }

})

exports.deleteUser=(async(req,res)=>{
    try{
        console.log("inside try block of delete user");
        if(req.session.isAdAuth){
            console.log("inside if block of delete user");
        let id=req.params.id;
        console.log(id);
        const deletedUser= await User.findOneAndDelete({_id:id})
        console.log("deleted user logged", deletedUser);
        if(deletedUser){
            console.log("inside deleted user");
            req.flash('userDeleted',"User Successfully deleted");
            res.redirect("/admin/adminDashboard")
        }
        }else{
            res.redirect("/admin/adminDashboard")
        }
    }catch(error){
        console.error("Error deleting the user",error);
    }
})

// module.exports={
//     registerUser,
//     getRegisterPage,
//     loginUser,
//     logoutUser
// };